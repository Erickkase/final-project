# EmoTrack Infrastructure - 10 Microservices Architecture

## Arquitectura

La infraestructura está diseñada para desplegar 10 microservicios organizados en 5 pares de servicios, cada par ejecutándose en su propio Auto Scaling Group con mínimo 2 instancias EC2.

### Service Pairs Distribution

#### Pair 1: API Gateway + Auth Service
- **API Gateway** (Port 3000) - `/api/*`
- **Auth Service** (Port 3001) - `/auth/*`
- **ASG**: 2-4 instancias t2.micro

#### Pair 2: Emotion + Report Services
- **Emotion Service** (Port 3002) - `/emotions/*`
- **Report Service** (Port 3004) - `/reports/*`
- **ASG**: 2-4 instancias t2.micro

#### Pair 3: Notification + User Services
- **Notification Service** (Port 3005) - `/notifications/*`
- **User Service** (Port 3006) - `/users/*`
- **ASG**: 2-4 instancias t2.micro

#### Pair 4: Analytics + Goal Services
- **Analytics Service** (Port 3007) - `/analytics/*`
- **Goal Service** (Port 3008) - `/goals/*`
- **ASG**: 2-4 instancias t2.micro

#### Pair 5: Journal + Recommendation Services
- **Journal Service** (Port 3009) - `/journal/*`
- **Recommendation Service** (Port 3010) - `/recommendations/*`
- **ASG**: 2-4 instancias t2.micro

## Infrastructure Components

### Application Load Balancer (ALB)
- **Single DNS Endpoint**: All services accessible through one domain
- **Path-based Routing**: Routes requests to appropriate service pair
- **Health Checks**: Monitors `/health` endpoint for each service
- **Security Group**: Allows HTTP (80) and HTTPS (443)

### Auto Scaling Groups (5 total)
- **Minimum Capacity**: 2 instances per pair
- **Desired Capacity**: 2 instances per pair
- **Maximum Capacity**: 4 instances per pair
- **Health Check Type**: ELB
- **Health Check Grace Period**: 300 seconds

### Scaling Policies
Each ASG has:
- **Scale Up**: Trigger when CPU > 70% for 2 consecutive periods (120s each)
- **Scale Down**: Trigger when CPU < 30% for 2 consecutive periods (120s each)
- **Cooldown Period**: 300 seconds

### Security Groups
- **ALB Security Group**: Allows inbound HTTP/HTTPS from internet
- **Instance Security Groups** (5 total): One per pair, allows:
  - SSH (port 22) from anywhere
  - Service ports from ALB only
  - All outbound traffic

### Monitoring
- **CloudWatch Dashboard**: Monitors CPU utilization, ALB response time, and request count
- **SNS Topic**: Sends alerts for ASG scaling events
- **Email Notifications**: Configured for ievinan@uce.edu.ec

## Deployment

### Prerequisites
```bash
export TF_VAR_AWS_ACCESS_KEY_ID="your-access-key"
export TF_VAR_AWS_SECRET_ACCESS_KEY="your-secret-key"
export TF_VAR_AWS_SESSION_TOKEN="your-session-token"
export TF_VAR_jwt_secret="your-jwt-secret"
export TF_VAR_docker_hub_username="your-dockerhub-username"
export TF_VAR_vpc_id="vpc-xxxxx"
export TF_VAR_subnet1="subnet-xxxxx"
export TF_VAR_subnet2="subnet-xxxxx"
```

### Deploy Infrastructure
```bash
cd infra
terraform init
terraform plan
terraform apply
```

### Verify Deployment
```bash
# Get ALB DNS
terraform output alb_dns_name

# Test services
curl http://<alb-dns>/api/health
curl http://<alb-dns>/auth/health
curl http://<alb-dns>/emotions/health
curl http://<alb-dns>/reports/health
curl http://<alb-dns>/notifications/health
curl http://<alb-dns>/users/health
curl http://<alb-dns>/analytics/health
curl http://<alb-dns>/goals/health
curl http://<alb-dns>/journal/health
curl http://<alb-dns>/recommendations/health
```

## Outputs

After deployment, Terraform provides:
- `alb_dns_name`: Main DNS endpoint for all services
- `service_urls`: Direct URLs for each service
- `pair_X_asg_name`: ASG names for each service pair
- `cloudwatch_dashboard_url`: CloudWatch monitoring dashboard
- `sns_topic_arn`: SNS topic for alerts

## Cost Estimation

### Per Month (us-east-1)
- **EC2 Instances**: 10 t2.micro instances (2 per pair) × $0.0116/hour × 730 hours = ~$84.68
- **Application Load Balancer**: 1 ALB × $16.20/month + data processed = ~$20-30
- **Data Transfer**: Varies based on usage
- **CloudWatch**: Basic monitoring included, detailed metrics extra

**Estimated Total**: ~$105-115/month for minimum configuration

## Scaling Behavior

### Normal Operation
- Each pair maintains 2 instances (10 total)
- Handles baseline traffic efficiently
- Health checks every 30 seconds

### High Load
- ASGs scale up to 4 instances per pair (20 total)
- Triggered by CPU > 70%
- New instances join after health check passes

### Low Load
- ASGs scale down to 2 instances per pair (never below minimum)
- Triggered by CPU < 30%
- Ensures minimum redundancy always maintained

## Disaster Recovery

### Instance Failure
- ALB detects failed health checks
- ASG launches replacement instance automatically
- No service disruption (minimum 1 healthy instance remaining)

### AZ Failure
- Instances distributed across 2 availability zones
- ALB routes to healthy AZ automatically
- Service continues with degraded capacity

### Complete Failure
- Terraform state preserved
- Run `terraform apply` to recreate infrastructure
- Docker images pulled from Docker Hub
- Recovery time: ~10-15 minutes

## Maintenance

### Update Docker Images
```bash
# Update image_tag variable
terraform apply -var="image_tag=v1.5"
```

### Scale Manually
```bash
# Update ASG capacity
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name emotrack-pair-1-asg \
  --desired-capacity 3
```

### View Logs
```bash
# SSH to instance
ssh -i ~/.ssh/emotrack-pair-1-key.pem ubuntu@<instance-ip>

# View docker logs
cd /home/ubuntu
docker-compose logs -f
```

## Troubleshooting

### Service Not Responding
1. Check ALB target health:
   ```bash
   aws elbv2 describe-target-health --target-group-arn <target-group-arn>
   ```

2. SSH to instance and check Docker:
   ```bash
   docker-compose ps
   docker-compose logs <service-name>
   ```

3. Verify security groups allow traffic

### High CPU Usage
1. Check CloudWatch dashboard
2. Verify ASG is scaling up
3. Check for memory leaks in application logs

### Deployment Failures
1. Verify all required variables are set
2. Check AWS credentials and permissions
3. Review Terraform error messages
4. Ensure VPC and subnets exist

## Architecture Diagram

```
                                    Internet
                                       |
                                       v
                              [Application Load Balancer]
                                       |
                    +------------------+------------------+
                    |                  |                  |
            [Path Routing]      [Path Routing]    [Path Routing]
                    |                  |                  |
         +---------+---------+  +------+------+  +-------+--------+
         |                   |  |             |  |                |
    [Pair 1 ASG]       [Pair 2 ASG]   [Pair 3 ASG]  [Pair 4 ASG]  [Pair 5 ASG]
    Min: 2, Max: 4     Min: 2, Max: 4  Min: 2, Max: 4  Min: 2, Max: 4  Min: 2, Max: 4
         |                   |  |             |  |                |
    [API Gateway]      [Emotion]      [Notification]  [Analytics]  [Journal]
    [Auth Service]     [Report]       [User]          [Goal]       [Recommendation]
    Port 3000,3001     Port 3002,3004 Port 3005,3006  Port 3007,3008  Port 3009,3010
```

## Module Structure

```
infra/
├── main.tf                 # Main infrastructure definition
├── variables.tf            # Input variables
├── outputs.tf             # Output values
└── modules/
    ├── service-pair/      # Reusable module for service pairs
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── microservice/      # Docker compose templates
        ├── docker-compose-pair-1.tpl
        ├── docker-compose-pair-2.tpl
        ├── docker-compose-pair-3.tpl
        ├── docker-compose-pair-4.tpl
        └── docker-compose-pair-5.tpl
```
