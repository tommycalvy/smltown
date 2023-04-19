import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as rds from "aws-cdk-lib/aws-rds";
import * as dynamo from "aws-cdk-lib/aws-dynamodb";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as iam from "aws-cdk-lib/aws-iam";

export class SmltownStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const account = cdk.Stack.of(this).account;
        const region = cdk.Stack.of(this).region;
        const dynamodbTableName = "SMLTOWN";
        const instanceIdentifier = "KratosDB";
        const creds = new rds.DatabaseSecret(this, "MyKratosDBCredentials", {
            secretName: `/${id}/rds/creds/${instanceIdentifier}`.toLowerCase(),
            username: "admin",
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
                  name: 'private',
                  subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
             ]
        });

        

        // Create an ECS cluster
        const cluster = new ecs.Cluster(this, "SmltownCluster", {
            clusterName: "SmltownCluster",
            containerInsights: true,
            vpc: vpc,
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

        // Create an RDS PostgreSQL instance
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
                vpcSubnets: {
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
            }),
        });
        // Creates a dsn string for the RDS instance from the credentials secret
        const username = creds.secretValueFromJson("username").unsafeUnwrap();
        const password = creds.secretValueFromJson("password").unsafeUnwrap();
        const dsn = `postgres://${username}:${password}@${kratosDB.dbInstanceEndpointAddress}:5432/kratos`;

        
        // Create a new Fargate task that initializes the database using the ory kratros image with the migrate command
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
                portMappings: [
                    {
                        containerPort: 4433,
                        hostPort: 4433,
                        protocol: ecs.Protocol.TCP,
                    },
                ],
            }
        );
      
        const kratosMigrateService = new ecs.FargateService(
            this,
            "KratosMigrateService",
            {
                cluster: cluster,
                taskDefinition: kratosMigrateTask,
                desiredCount: 0,
                vpcSubnets: {
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },

            }
        );
        kratosDB.connections.allowFrom(kratosMigrateService, ec2.Port.tcp(5432));

         // Create a new Fargate task that serves the ory kratos service
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

               

        const sveltekitService = new ecs_patterns.ApplicationLoadBalancedFargateService(
            this,
            "SvelteKitService",
            {
                cluster: cluster,
                circuitBreaker: {
                    rollback: true,
                },
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
                taskImageOptions: {
                    image: ecs.ContainerImage.fromEcrRepository(sveltekitServiceRepo, "0.1"),
                    containerPort: 3000,
                    environment: {
                        KRATOS_PUBLIC_URL:  "http://localhost:4433",
                        KRATOS_ADMIN_URL:   "http://localhost:4434",
                        CRUD_SERVICE_URL:   "http://localhost:5656",
                        ORIGIN:             "https://sml.town",
                        PROTOCOL_HEADER:    "x-forwarded-proto", 
                        HOST_HEADER:        "x-forwarded-host",
                        ADDRESS_HEADER:     "X-Forwarded-For",
                        XFF_DEPTH:          "1",
                    },
                },
                desiredCount: 1,
                publicLoadBalancer: true,
                domainName: "sml.town",
                domainZone: new PublicHostedZone(this, 'HostedZone', { zoneName: 'sml.town' }),
                protocol: ApplicationProtocol.HTTPS,
            }
        );

        const crudService = new ecs_patterns.ApplicationLoadBalancedFargateService(
            this,
            "CrudService",
            {
                cluster: cluster,
                circuitBreaker: {
                    rollback: true,
                },
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
                taskImageOptions: {
                    image: ecs.ContainerImage.fromEcrRepository(crudServiceRepo, "0.2"),
                    containerPort: 5656,
                    environment: {
                        FILTER_SERVICE_ENDPOINT: "http://localhost:5051",
                        AWS_TABLE_NAME: dynamodbTableName,
                        AWS_REGION: region,
                    }
                },
                desiredCount: 1,
                publicLoadBalancer: false,
            }
        );
        crudService.service.connections.allowFrom(sveltekitService.service, ec2.Port.tcp(5656));

        crudService.service.taskDefinition.taskRole.addToPrincipalPolicy(dynamoDbPolicy);

        const filterService = new ecs_patterns.ApplicationLoadBalancedFargateService(
            this,
            "FilterService",
            {
                cluster: cluster,
                circuitBreaker: {
                    rollback: true,
                },
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
                taskImageOptions: {
                    image: ecs.ContainerImage.fromEcrRepository(filterServiceRepo, "0.1"),
                    containerPort: 5051,
                    environment: {
                        SERVER_PORT: "5051",
                        AWS_TABLE_NAME: dynamodbTableName,
                        AWS_REGION: region,
                    },
                },
                desiredCount: 1,
                publicLoadBalancer: false,
            }
        );
        filterService.service.connections.allowFrom(crudService.service, ec2.Port.tcp(5051));
        filterService.service.taskDefinition.taskRole.addToPrincipalPolicy(dynamoDbPolicy);

        const oryKratosService = new ecs_patterns.ApplicationMultipleTargetGroupsFargateService(
            this,
            "OryKratosService",
            {
                cluster: cluster,
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
                desiredCount: 1,
                taskDefinition: oryKratosTask,
                loadBalancers: [
                    {
                        name: "oryKratosPublic",
                        publicLoadBalancer: false,
                        listeners: [{ name: "publicListener" }]
                    },
                    {
                        name: "oryKratosAdmin",
                        publicLoadBalancer: false,
                        listeners: [{ name: "adminListener" }]
                    }
                ],
                targetGroups: [
                    {
                      containerPort: 4433,
                      listener: 'publicListener',
                    },
                    {
                      containerPort: 4434,
                      listener: 'adminListener',
                    },
                ],
            });
        oryKratosService.service.connections.allowFrom(sveltekitService.service, ec2.Port.tcp(4433));
        oryKratosService.service.connections.allowFrom(sveltekitService.service, ec2.Port.tcp(4434));
        kratosDB.connections.allowFrom(oryKratosService.service, ec2.Port.tcp(5432));

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

        crudService.service
            .autoScaleTaskCount(scalingOptions)
            .scaleOnCpuUtilization("CrudCpuScaling", {
                targetUtilizationPercent: 70,
            });

        filterService.service
            .autoScaleTaskCount(scalingOptions)
            .scaleOnCpuUtilization("FilterCpuScaling", {
                targetUtilizationPercent: 70,
            });

        oryKratosService.service
            .autoScaleTaskCount(scalingOptions)
            .scaleOnCpuUtilization("OryKratosCpuScaling", {
                targetUtilizationPercent: 70,
            });

        
        // Create a new Fargate task that imports the admin identity
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
                    KRATOS_ADMIN_URL: "http://localhost:4434",
                    DSN: dsn,
                },
                portMappings: [
                    {
                        containerPort: 4433,
                        hostPort: 4433,
                        protocol: ecs.Protocol.TCP,
                    },
                ],
            }
        );
        
        const kratosImportService = new ecs.FargateService(
            this,
            "KratosImportService",
            {
                cluster: cluster,
                taskDefinition: kratosMigrateTask,
                desiredCount: 0,
                vpcSubnets: {
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },

            }
        );
        kratosDB.connections.allowFrom(kratosImportService, ec2.Port.tcp(5432));


    }
}
