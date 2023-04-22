import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as route53 from 'aws-cdk-lib/aws-route53';
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

export class SmltownStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const account = cdk.Stack.of(this).account;
        const region = cdk.Stack.of(this).region;
        const dynamodbTableName = "SMLTOWN";
        const instanceIdentifier = "KratosDB";
        const creds = new rds.DatabaseSecret(this, "MyKratosDBCredentials", {
            secretName: `/${id}/rds/creds/${instanceIdentifier}`.toLowerCase(),
            username: "orykratosadmin",
        });

        // Create a VPC
        const vpc = new ec2.Vpc(this, "Vpc", {
            maxAzs: 2,
            subnetConfiguration: [
                {
                  cidrMask: 24,
                  name: 'public',
                  subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'private_with_egress',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
                {
                  cidrMask: 24,
                  name: 'private_isolated',
                  subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
             ],

        });

        

        // Create an ECS cluster
        const cluster = new ecs.Cluster(this, "SmltownCluster", {
            clusterName: "SmltownCluster",
            containerInsights: true,
            vpc: vpc,
            defaultCloudMapNamespace: {
                name: "smltown",
            }
        });

        // Amazon ECR Repositories
        const sveltekitServiceRepo = ecr.Repository.fromRepositoryName(
            this,
            "SveltekitServiceRepo",
            "smltown_sveltekit_service"
        );
    
        const crudServiceRepo = ecr.Repository.fromRepositoryName(
            this,
            "CrudServiceRepo",
            "smltown_crud_service"
        );

        const filterServiceRepo = ecr.Repository.fromRepositoryName(
            this,
            "FilterServiceRepo",
            "smltown_filter_service"
        );
    
        const oryKratosRepo = ecr.Repository.fromRepositoryName(
            this,
            "OryKratosRepo",
            "smltown_ory_kratos"
        );

        

        // Create a policy to grant read and write access to the DynamoDB table SMLTOWN in us-east-1
        const dynamoDbPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:BatchGetItem", "dynamodb:BatchWriteItem", "dynamodb:Query", "dynamodb:Scan"],
            resources: [`arn:aws:dynamodb:${region}:${account}:table/${dynamodbTableName}`],
        });

        // KRATOS DATABASE
        const kratosDB = new rds.DatabaseInstance(this, "KratosDB", {
            vpc: vpc,
            port: 5432,
            credentials: rds.Credentials.fromSecret(creds),
            databaseName: "kratos",
            allocatedStorage: 20,
            instanceIdentifier,
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_15_2,
            }),
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T4G,
                ec2.InstanceSize.MICRO
            ),
            multiAz: false,
            autoMinorVersionUpgrade: true,
            subnetGroup: new rds.SubnetGroup(this, "KratosDBSubnetGroup", {
                vpc: vpc,
                description: "Subnet group for KratosDB",
                vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED })
            }),
        });
        // Creates a dsn string for the RDS instance from the credentials secret
        const username = creds.secretValueFromJson("username").unsafeUnwrap();
        const password = creds.secretValueFromJson("password").unsafeUnwrap();
        const dsn = `postgres://${username}:${password}@${kratosDB.dbInstanceEndpointAddress}:5432/kratos`;

        
        // KRATOS MIGRATE SERVICE
        const kratosMigrateTask = new ecs.FargateTaskDefinition(
            this,
            "KratosMigrateTask",
            {
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
                
            }
        );
        kratosMigrateTask.addContainer(
            "KratosMigrateContainer",
            {
                image: ecs.ContainerImage.fromEcrRepository(oryKratosRepo, "0.1"),
                command: ["migrate", "-c", "kratos-production.yml", "sql", "-e", "--yes"],
                environment: {
                    DSN: dsn,
                },
            }
        );
      
        const kratosMigrateService = new ecs.FargateService(
            this,
            "KratosMigrateService",
            {
                cluster: cluster,
                taskDefinition: kratosMigrateTask,
                desiredCount: 1,
                vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }),
            }
        );
        kratosDB.connections.allowFrom(kratosMigrateService, ec2.Port.tcp(5432));

         // ORY KRATOS SERVICE
         const oryKratosTask = new ecs.FargateTaskDefinition(
            this,
            "OryKratosTask",
            {
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
            }
        );
        oryKratosTask.addContainer(
            "OryKratosContainer",
            {
                image: ecs.ContainerImage.fromEcrRepository(oryKratosRepo, "0.1"),
                command: ["serve", "-c", "kratos-production.yml", "--watch-courier"],
                environment: {
                    DSN: dsn,
                },
                portMappings: [
                    {
                        containerPort: 4433,
                        hostPort: 4433,
                        protocol: ecs.Protocol.TCP,
                    },
                    {
                        containerPort: 4434,
                        hostPort: 4434,
                        protocol: ecs.Protocol.TCP,
                    },
                ],
            }
        );

        const oryKratosService = new ecs.FargateService(
            this,
            "OryKratosService",
            {
                cluster: cluster,
                taskDefinition: oryKratosTask,
                desiredCount: 1,
                vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }),
                cloudMapOptions: {
                    name: "ory-kratos-service"
                }
            }
        );
        // Create the load balancers and listeners
        const lbPublic = new elbv2.ApplicationLoadBalancer(this, "OryKratosPublic", {
            vpc,
            internetFacing: false,
        });
        const publicListener = lbPublic.addListener("PublicListener", {
            port: 4433,
            protocol: elbv2.ApplicationProtocol.HTTP,
        });
        
        const lbAdmin = new elbv2.ApplicationLoadBalancer(this, "OryKratosAdmin", {
            vpc,
            internetFacing: false,
            
        });
        const adminListener = lbAdmin.addListener("AdminListener", {
            port: 4434,
            protocol: elbv2.ApplicationProtocol.HTTP, 
        });
        // Add target groups
        publicListener.addTargets("PublicTargetGroup", {
            port: 4433,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [oryKratosService],
            healthCheck: {
                path: "/health/ready",
                healthyHttpCodes: "200",
            },
        });
        adminListener.addTargets("AdminTargetGroup", {
            port: 4434,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [oryKratosService],
            healthCheck: {
                path: "/health/ready",
                healthyHttpCodes: "200",
            },
        });
        kratosDB.connections.allowFrom(oryKratosService, ec2.Port.tcp(5432));

        // FILTER SERVICE
        const filterServiceTask = new ecs.FargateTaskDefinition(
            this,
            "FilterServiceTask",
            {
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
            }
        );
        filterServiceTask.addContainer(
            "FilterServiceContainer",
            {
                image: ecs.ContainerImage.fromEcrRepository(filterServiceRepo, "0.1"),
                environment: {
                    SERVER_PORT: "50051",
                    AWS_TABLE_NAME: dynamodbTableName,
                    AWS_REGION: region,
                },
                portMappings: [
                    {
                        containerPort: 50051,
                        hostPort: 50051,
                        protocol: ecs.Protocol.TCP,
                    },
                ],
            }
        );
        const filterService = new ecs.FargateService(
            this,
            "FilterService",
            {
                cluster: cluster,
                taskDefinition: filterServiceTask,
                desiredCount: 1,
                vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }),
                cloudMapOptions: { name: "filter-service" },
            }
        );
        filterService.taskDefinition.taskRole.addToPrincipalPolicy(dynamoDbPolicy);
      
        // CRUD SERVICE TODO: need to reduce to manually created load balancer to specify health path
        const crudServiceTask = new ecs.FargateTaskDefinition(
            this,
            "CrudServiceTask",
            {
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
            }
        );
        crudServiceTask.addContainer(
            "CrudServiceContainer",
            {
                image: ecs.ContainerImage.fromEcrRepository(crudServiceRepo, "0.2"),
                environment: {
                    FILTER_SERVICE_ENDPOINT: "http://filter-service.smltown:50051",
                    AWS_TABLE_NAME: dynamodbTableName,
                    AWS_REGION: region,
                },
                portMappings: [
                    {
                        containerPort: 5656,
                        hostPort: 5656,
                        protocol: ecs.Protocol.TCP,
                    },
                ],
            }
        );
        const crudService = new ecs.FargateService(
            this,
            "CrudService",
            {
                cluster: cluster,
                taskDefinition: crudServiceTask,
                desiredCount: 1,
                vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }),
                cloudMapOptions: { name: "crud-service" },
            }
        );
        crudService.taskDefinition.taskRole.addToPrincipalPolicy(dynamoDbPolicy);
        filterService.connections.allowFrom(crudService, ec2.Port.tcp(50051));
        
        // SVELTEKIT SERVICE
        const sveltekitService = new ecs_patterns.ApplicationLoadBalancedFargateService(
            this,
            "SvelteKitService",
            {
                cluster: cluster,
                circuitBreaker: {
                    rollback: false,
                },
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
                taskImageOptions: {
                    image: ecs.ContainerImage.fromEcrRepository(sveltekitServiceRepo, "0.3"),
                    containerPort: 3000,
                    environment: {
                        KRATOS_PUBLIC_URL:  "http://ory-kratos-service.smltown:4433",
                        KRATOS_ADMIN_URL:   "http://ory-kratos-service.smltown:4434",
                        CRUD_SERVICE_URL:   "http://crud-service.smltown:5656",
                        ORIGIN:             "https://sml.town",
                    },
                },
                taskSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }),
                desiredCount: 1,
                loadBalancerName: "sveltekitlb",
                publicLoadBalancer: true,
                domainName: "sml.town",
                domainZone: route53.HostedZone.fromLookup(this, "SmltownHostedZone", {
                    domainName: "sml.town"
                }),
                protocol: ApplicationProtocol.HTTPS,
                
            }
        );
        sveltekitService.loadBalancer.setAttribute("routing.http.xff_header_processing.mode", "append");
        // Update security group rules
        oryKratosService.connections.allowFrom(sveltekitService.service, ec2.Port.tcp(4433));
        oryKratosService.connections.allowFrom(sveltekitService.service, ec2.Port.tcp(4434));
        crudService.connections.allowFrom(sveltekitService.service, ec2.Port.tcp(5656));

                
        // Configure Scaling Policies
        const scalingOptions = {
            minCapacity: 1,
            maxCapacity: 3,
        };

        sveltekitService.service
            .autoScaleTaskCount(scalingOptions)
            .scaleOnCpuUtilization("SveltekitCpuScaling", {
                targetUtilizationPercent: 70,
            });

        oryKratosService
            .autoScaleTaskCount(scalingOptions)
            .scaleOnCpuUtilization("OryKratosCpuScaling", {
                targetUtilizationPercent: 70,
            });

        
        // KRATOS IMPORT SERVICE
        const kratosImportTask = new ecs.FargateTaskDefinition(
            this,
            "KratosImportTask",
            {
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
            }
        );
        kratosImportTask.addContainer(
            "KratosImportContainer",
            {
                image: ecs.ContainerImage.fromEcrRepository(oryKratosRepo, "0.1"),
                command: ["import", "identities", "admin.json"],
                environment: {
                    KRATOS_ADMIN_URL: "http://ory-kratos-service.smltown:4434",
                    DSN: dsn,
                },
            }
        );
        const kratosImportService = new ecs.FargateService(
            this,
            "KratosImportService",
            {
                cluster: cluster,
                taskDefinition: kratosMigrateTask,
                desiredCount: 1,
                vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }),
            }
        );
        kratosDB.connections.allowFrom(kratosImportService, ec2.Port.tcp(5432));

    }
}
