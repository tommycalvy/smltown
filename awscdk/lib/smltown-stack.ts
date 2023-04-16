import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as rds from "aws-cdk-lib/aws-rds";
import * as dynamo from "aws-cdk-lib/aws-dynamodb";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { CdkResourceInitializer } from "./resource-initializer";
import { DockerImageCode } from 'aws-cdk-lib/aws-lambda';
import * as ecr from "aws-cdk-lib/aws-ecr";
import { aws_certificatemanager as certificatemanager } from 'aws-cdk-lib';
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { aws_route53_targets as route53_targets } from "aws-cdk-lib";
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";

export class SmltownStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const instanceIdentifier = "KratosDB";
        const credsSecretName =
            `/${id}/rds/creds/${instanceIdentifier}`.toLowerCase();
        const creds = new rds.DatabaseSecret(this, "MyKratosDBCredentials", {
            secretName: credsSecretName,
            username: "admin",
        });

        // Create a VPC
        const vpc = new ec2.Vpc(this, "Vpc", { 
            maxAzs: 1,
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

        // A new ecr Repository for for the resource initializer
        const oryKratosRepo = new ecr.Repository(this, 'OryKratosRepo');

        // Create a DynamoDB table
        const dynamoTable = new dynamo.Table(this, "DynamoTable", {
            partitionKey: { name: "PK", type: dynamo.AttributeType.STRING },
            sortKey: { name: "SK", type: dynamo.AttributeType.NUMBER },
            billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
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
            subnetGroup: 
        });
        // Creates a dsn string for the RDS instance from the credentials secret
        const username = creds.secretValueFromJson("username").toString();
        const password = creds.secretValueFromJson("password").toString();
        const dsn = `postgresql://${username}:${password}@${kratosDB.dbInstanceEndpointAddress}:5432/kratos`;

        // Initialize the RDS KratosDB instance
        const initializer = new CdkResourceInitializer(this, 'KratosDBInit', {
            config: {
                credsSecretName
            },
            fnLogRetention: RetentionDays.FIVE_MONTHS,
            fnCode: DockerImageCode.fromEcr(oryKratosRepo),
            fnTimeout: cdk.Duration.minutes(2),
            fnSecurityGroups: [],
            vpc,
            subnetsSelection: vpc.selectSubnets({
                subnetType: SubnetType.PRIVATE_WITH_NAT
            })
        });
        // manage resources dependency
        initializer.customResource.node.addDependency(kratosDB);
    
        // allow the initializer function to connect to the RDS instance
        kratosDB.connections.allowFrom(initializer.function, ec2.Port.tcp(5432));
    
        // allow initializer function to read RDS instance creds secret
        creds.grantRead(initializer.function);


        const oryKratosTask = new ecs.FargateTaskDefinition(this, "OryKratosTask", {
            memoryLimitMiB: 512,
            cpu: 256,
        });
        oryKratosTask.addContainer("OryKratosContainer", {
            image: oryKratosImage,
        });

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
                taskImageOptions: {
                    image: ecs.ContainerImage.fromRegistry("#sveltekitImagePlaceholder"),
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
                taskImageOptions: {
                    image: ecs.ContainerImage.fromRegistry("#crudServiceImagePlaceholder"),
                    containerPort: 5656,
                    environment: {
                        AWS_TABLE_NAME: "SMLTOWN",
                        AWS_TABLE_ENDPOINT: "http://localhost:8000",
                        FILTER_SERVICE_ENDPOINT: "http://localhost:5051",
                        DYNAMODB_ENDPOINT: "http://dynamodb-local:8000",
                        AWS_ACCESS_KEY_ID: "AKID",
                        AWS_SECRET_ACCESS_KEY: "SECRET",
                        AWS_SESSION_TOKEN: "TOKEN",
                        AWS_REGION: "us-east-1",
                    }
                },
                desiredCount: 1,
                publicLoadBalancer: false,
            }
        );
        crudService.service.connections.allowFrom(sveltekitService.service, ec2.Port.tcp(5656));

        dynamoTable.grantReadWriteData(crudService.service.taskDefinition.taskRole);

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
                taskImageOptions: {
                    image: ecs.ContainerImage.fromRegistry("#filterServiceImagePlaceholder"),
                    containerPort: 5051,
                    environment: {
                        SERVER_PORT: "5051"
                    },
                },
                desiredCount: 1,
                publicLoadBalancer: false,
            }
        );
        filterService.service.connections.allowFrom(crudService.service, ec2.Port.tcp(5051));

        const oryKratosService = new ecs_patterns.ApplicationMultipleTargetGroupsFargateService(
            this,
            "OryKratosService",
            {
                cluster: cluster,
                memoryLimitMiB: 512,
                cpu: 256,
                desiredCount: 1,
                taskImageOptions: {
                    image: ecs.ContainerImage.fromRegistry("#oryKratosImagePlaceholder"),
                    environment: {
                        DSN: dsn
                    },
                },
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
        kratosDB.connections.allowFrom(oryKratosService.service, ec2.Port.tcp(5432));

        // Configure Scaling Policies
        const scalingOptions = {
            minCapacity: 1,
            maxCapacity: 3,
        };

        sveltekitService.service
            .autoScaleTaskCount(scalingOptions)
            .scaleOnCpuUtilization("SvelteKitCpuScaling", {
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

    }
}
