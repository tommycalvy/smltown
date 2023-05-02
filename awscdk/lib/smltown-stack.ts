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
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class SmltownStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const account = cdk.Stack.of(this).account;
        const region = cdk.Stack.of(this).region;
        const dynamodbTableName = "SMLTOWN";
        const instanceIdentifier = "KratosDB";
        /*
        const creds = new rds.DatabaseSecret(this, "MyKratosDBCredentials", {
            secretName: `/${id}/rds/creds/${instanceIdentifier}`.toLowerCase(),
            username: "orykratosadmin",
            excludeCharacters: " %^+=~`#$&*()-_|[]{}:;<>.?!'/@\"\\",
        });
        */
        const username = 'orykratosadmin';

        // Create a VPC
        const vpc = new ec2.Vpc(this, "Vpc", {
            maxAzs: 2,
            natGateways: 1,
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

        const logGroup = new logs.LogGroup(this, 'LogGroup', {
            logGroupName: "SMLTOWN_LOGS",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
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
        const kratosDB = new rds.DatabaseInstanceFromSnapshot(this, "KratosDB", {
            vpc: vpc,
            port: 5432,
            snapshotIdentifier: "smltown-kratosdb-4-28-23",
            credentials: rds.SnapshotCredentials.fromGeneratedSecret(username, {
                excludeCharacters: " %^+=~`#$&*()-_|[]{}:;<>.?!'/@\"\\",
            }),
            //databaseName: "kratos",
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
        //const username = creds.secretValueFromJson("username").unsafeUnwrap();
        //const password = creds.secretValueFromJson("password").unsafeUnwrap();
        //const username = kratosDB.secret?.secretValueFromJson("username").unsafeUnwrap() ?? "";
        //const password = kratosDB.secret?.secretValueFromJson("password").unsafeUnwrap() ?? "";
        //const dbSecret = rds.Secret.fromSecretCompleteArn(this, 'KratosDBSecret', kratosDB.secret.secretCompleteArn);
        const dbSecret = rds.DatabaseSecret.fromSecretCompleteArn(this, 'KratosDBSecret', kratosDB.secret?.secretFullArn ?? "");
        /*
        const dsnString = dbSecret.secretValueFromJson('password').toString().concat(
        '://',
        dbSecret.secretValueFromJson('username').toString(),
        ':',
        dbSecret.secretValueFromJson('password').toString(),
        '@',
        kratosDB.instanceEndpoint.hostname,
        ':',
        kratosDB.instanceEndpoint.port.toString(),
        '/',
        'kratos' // The database name
        );
        */
       const password = dbSecret.secretValueFromJson('password').unsafeUnwrap();
        const dsn = `postgres://${username}:${password}@${kratosDB.dbInstanceEndpointAddress}:5432/kratos?sslmode=verify-full&sslrootcert=/home/ory/us-east-1-bundle.pem`;
        // dsn = `postgres://orykratosadmin:${password}@${kratosDB.dbInstanceEndpointAddress}:5432/kratos?sslmode=verify-full&sslrootcert=/home/ory/us-east-1-bundle.pem`;
        
        
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
                containerName: "kratos_migrate",
                image: ecs.ContainerImage.fromEcrRepository(oryKratosRepo, "0.2"),
                command: ["migrate", "-c", "kratos-production.yml", "sql", "-e", "--yes"],
                environment: {
                    DSN: dsn,
                },
                logging: ecs.LogDriver.awsLogs({
                    streamPrefix: "smltown", 
                    logGroup,
                }),
            }
        );
      
        const kratosMigrateService = new ecs.FargateService(
            this,
            "KratosMigrateService",
            {
                cluster: cluster,
                taskDefinition: kratosMigrateTask,
                desiredCount: 0,
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
                containerName: "ory_kratos_service",
                image: ecs.ContainerImage.fromEcrRepository(oryKratosRepo, "0.2"),
                command: ["serve", "-c", "kratos-production.yml", "--watch-courier"],
                environment: {
                    DSN: dsn,
                    SERVE_PUBLIC_URL: "http://ory-kratos-service.smltown:4433",
                    SERVE_PUBLIC_HOST: "0.0.0.0",
                    SERVE_ADMIN_URL: "http://ory-kratos-service.smltown:4434",
                    SERVE_PUBLIC_ADMIN: "0.0.0.0"
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
                logging: ecs.LogDriver.awsLogs({
                    streamPrefix: "smltown",
                    logGroup,
                })
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
                },
            }
        );
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
                containerName: "filter_service",
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
                logging: ecs.LogDriver.awsLogs({
                    streamPrefix: "smltown",
                    logGroup,
                })
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
                containerName: "crud_service",
                image: ecs.ContainerImage.fromEcrRepository(crudServiceRepo, "0.2"),
                environment: {
                    FILTER_SERVICE_ENDPOINT: "filter-service.smltown:50051",
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
                logging: ecs.LogDriver.awsLogs({
                    streamPrefix: "smltown",
                    logGroup,
                })
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
                    containerName: "sveltekit_service",
                    image: ecs.ContainerImage.fromEcrRepository(sveltekitServiceRepo, "0.7"),
                    containerPort: 3000,
                    environment: {
                        KRATOS_PUBLIC_URL:  "http://ory-kratos-service.smltown:4433",
                        KRATOS_ADMIN_URL:   "http://ory-kratos-service.smltown:4434",
                        CRUD_SERVICE_URL:   "http://crud-service.smltown:5656",
                        ORIGIN:             "https://sml.town",
                    },
                    logDriver: ecs.LogDriver.awsLogs({
                        streamPrefix: "smltown",
                        logGroup,
                    })
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
                healthCheckGracePeriod: cdk.Duration.seconds(360),
            }
        );
        sveltekitService.loadBalancer.setAttribute("routing.http.xff_header_processing.mode", "append");
        // Update security group rules
        oryKratosService.connections.allowFrom(sveltekitService.service, ec2.Port.tcp(4433));
        oryKratosService.connections.allowFrom(sveltekitService.service, ec2.Port.tcp(4434));
        crudService.connections.allowFrom(sveltekitService.service, ec2.Port.tcp(5656));

        
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
                containerName: "kratos_import",
                image: ecs.ContainerImage.fromEcrRepository(oryKratosRepo, "0.2"),
                command: ["import", "identities", "admin.json"],
                environment: {
                    KRATOS_ADMIN_URL: "http://ory-kratos-service.smltown:4434",
                    DSN: dsn,
                },
                logging: ecs.LogDriver.awsLogs({
                    streamPrefix: "smltown",
                    logGroup,
                })
            }
        );
        const kratosImportService = new ecs.FargateService(
            this,
            "KratosImportService",
            {
                cluster: cluster,
                taskDefinition: kratosMigrateTask,
                desiredCount: 0,
                vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }),
            }
        );
        kratosDB.connections.allowFrom(kratosImportService, ec2.Port.tcp(5432));

    }
}
