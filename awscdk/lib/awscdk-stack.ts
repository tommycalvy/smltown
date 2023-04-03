import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as rds from "aws-cdk-lib/aws-rds";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

export class AwscdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create a VPC
        const vpc = new ec2.Vpc(this, "Vpc", {
            maxAzs: 2,
        });

        // Create an ECS cluster
        const cluster = new ecs.Cluster(this, "Cluster", {
            vpc: vpc,
        });

        // Create a DynamoDB table
        const dynamoTable = new dynamodb.Table(this, "DynamoTable", {
            partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        // Create an RDS PostgreSQL instance
        const dbInstance = new rds.DatabaseInstance(this, "DbInstance", {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_13_3,
            }),
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.BURSTABLE2,
                ec2.InstanceSize.SMALL
            ),
            vpc: vpc,
            multiAz: false,
            autoMinorVersionUpgrade: true,
        });

        // ECR repositories
        const sveltekitRepository = ecs.ContainerImage.fromRegistry(
            "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/sveltekit"
        );
        const crudRepository = ecs.ContainerImage.fromRegistry(
            "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/crud"
        );
        const filterRepository = ecs.ContainerImage.fromRegistry(
            "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/filter"
        );
        const oryKratosRepository = ecs.ContainerImage.fromRegistry(
            "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/ory-kratos"
        );

        // Create Task Definitions and Services
        const sveltekitTask = new ecs.FargateTaskDefinition(
            this,
            "SvelteKitTask",
            {
                memoryLimitMiB: 512,
                cpu: 256,
            }
        );
        sveltekitTask.addContainer("SvelteKitContainer", {
            image: sveltekitRepository,
        });

        const crudTask = new ecs.FargateTaskDefinition(this, "CrudTask", {
            memoryLimitMiB: 512,
            cpu: 256,
        });
        crudTask.addContainer("CrudContainer", {
            image: crudRepository,
        });

        const filterTask = new ecs.FargateTaskDefinition(this, "FilterTask", {
            memoryLimitMiB: 512,
            cpu: 256,
        });
        filterTask.addContainer("FilterContainer", {
            image: filterRepository,
        });

        const oryKratosTask = new ecs.FargateTaskDefinition(
            this,
            "OryKratosTask",
            {
                memoryLimitMiB: 512,
                cpu: 256,
            }
        );
        oryKratosTask.addContainer("OryKratosContainer", {
            image: oryKratosRepository,
        });

        const sveltekitService =
            new ecs_patterns.ApplicationLoadBalancedFargateService(
                this,
                "SvelteKitService",
                {
                    cluster: cluster,
                    taskDefinition: sveltekitTask,
                    desiredCount: 1,
                    publicLoadBalancer: true,
                }
            );

        const crudService =
            new ecs_patterns.ApplicationLoadBalancedFargateService(
                this,
                "CrudService",
                {
                    cluster: cluster,
                    taskDefinition: crudTask,
                    desiredCount: 1,
                }
            );

        const filterService =
            new ecs_patterns.ApplicationLoadBalancedFargateService(
                this,
                "FilterService",
                {
                    cluster: cluster,
                    taskDefinition: filterTask,
                    desiredCount: 1,
                }
            );

        const oryKratosService =
            new ecs_patterns.ApplicationLoadBalancedFargateService(
                this,
                "OryKratosService",
                {
                    cluster: cluster,
                    taskDefinition: oryKratosTask,
                    desiredCount: 1,
                }
            );

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

        // Set up domain and certificate
        const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
            domainName: "sml.town",
        });

        const certificate = new acm.DnsValidatedCertificate(
            this,
            "SiteCertificate",
            {
                domainName: "sml.town",
                hostedZone: hostedZone,
                region: "us-east-1", // ACM certificate must be in us-east-1 for CloudFront
            }
        );

        const sveltekitLoadBalancer = sveltekitService.loadBalancer;
        sveltekitLoadBalancer.addListeners("HttpsListener", {
            port: 443,
            protocol: elbv2.ApplicationProtocol.HTTPS,
            certificateArns: [certificate.certificateArn],
        });

        // Route53 record
        new route53.ARecord(this, "AliasRecord", {
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(
                new route53_targets.LoadBalancerTarget(sveltekitLoadBalancer)
            ),
            recordName: "sml.town",
        });
    }
}
