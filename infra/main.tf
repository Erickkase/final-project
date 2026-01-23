# Provider Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.AWS_REGION
}

# ============================================================
# SHARED APPLICATION LOAD BALANCER
# ============================================================

# Security Group para el ALB
resource "aws_security_group" "alb_sg" {
  name_prefix = "emotrack-alb-sg"
  vpc_id      = var.vpc_id

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS (futuro)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "emotrack-alb-sg"
  }
}

# Application Load Balancer Compartido
resource "aws_lb" "main_alb" {
  name               = "emotrack-main-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [var.subnet1, var.subnet2]

  tags = {
    Name = "emotrack-main-alb"
  }
}

# ALB Listener (puerto 80)
resource "aws_lb_listener" "main_listener" {
  load_balancer_arn = aws_lb.main_alb.arn
  port              = 80
  protocol          = "HTTP"
  
  # Default action - Return 404 for unknown paths
  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Service not found"
      status_code  = "404"
    }
  }
}

# ============================================================
# SERVICE PAIRS
# ============================================================

# Pair 1: API Gateway (3000) + Auth Service (3001)
module "pair_1" {
  source = "./modules/service-pair"
  
  pair_name                = "emotrack-pair-1"
  docker_compose_template  = "${path.module}/modules/microservice/docker-compose-pair-1.tpl"
  vpc_id                   = var.vpc_id
  subnet1                  = var.subnet1
  subnet2                  = var.subnet2
  jwt_secret               = var.jwt_secret
  docker_hub_username      = var.docker_hub_username
  tag                      = var.image_tag
  alb_sg_id                = aws_security_group.alb_sg.id
  alb_listener_arn         = aws_lb_listener.main_listener.arn
  priority_offset          = 100
  
  services = [
    {
      name  = "api-gateway"
      port  = 3000
      image = "${var.docker_hub_username}/emotrack-api-gateway"
      path  = "/api"
    },
    {
      name  = "auth-service"
      port  = 3001
      image = "${var.docker_hub_username}/emotrack-auth-service"
      path  = "/auth"
    }
  ]
}

# Pair 2: Emotion Service (3002) + Report Service (3004)
module "pair_2" {
  source = "./modules/service-pair"
  
  pair_name                = "emotrack-pair-2"
  docker_compose_template  = "${path.module}/modules/microservice/docker-compose-pair-2.tpl"
  vpc_id                   = var.vpc_id
  subnet1                  = var.subnet1
  subnet2                  = var.subnet2
  jwt_secret               = var.jwt_secret
  docker_hub_username      = var.docker_hub_username
  tag                      = var.image_tag
  alb_sg_id                = aws_security_group.alb_sg.id
  alb_listener_arn         = aws_lb_listener.main_listener.arn
  priority_offset          = 110
  
  services = [
    {
      name  = "emotion-service"
      port  = 3002
      image = "${var.docker_hub_username}/emotrack-emotion-service"
      path  = "/emotions"
    },
    {
      name  = "report-service"
      port  = 3004
      image = "${var.docker_hub_username}/emotrack-report-service"
      path  = "/reports"
    }
  ]
}

# Pair 3: Notification Service (3005) + User Service (3006)
module "pair_3" {
  source = "./modules/service-pair"
  
  pair_name                = "emotrack-pair-3"
  docker_compose_template  = "${path.module}/modules/microservice/docker-compose-pair-3.tpl"
  vpc_id                   = var.vpc_id
  subnet1                  = var.subnet1
  subnet2                  = var.subnet2
  jwt_secret               = var.jwt_secret
  docker_hub_username      = var.docker_hub_username
  tag                      = var.image_tag
  alb_sg_id                = aws_security_group.alb_sg.id
  alb_listener_arn         = aws_lb_listener.main_listener.arn
  priority_offset          = 120
  
  services = [
    {
      name  = "notification-service"
      port  = 3005
      image = "${var.docker_hub_username}/emotrack-notification-service"
      path  = "/notifications"
    },
    {
      name  = "user-service"
      port  = 3006
      image = "${var.docker_hub_username}/emotrack-user-service"
      path  = "/users"
    }
  ]
}

# Pair 4: Analytics Service (3007) + Goal Service (3008)
module "pair_4" {
  source = "./modules/service-pair"
  
  pair_name                = "emotrack-pair-4"
  docker_compose_template  = "${path.module}/modules/microservice/docker-compose-pair-4.tpl"
  vpc_id                   = var.vpc_id
  subnet1                  = var.subnet1
  subnet2                  = var.subnet2
  jwt_secret               = var.jwt_secret
  docker_hub_username      = var.docker_hub_username
  tag                      = var.image_tag
  alb_sg_id                = aws_security_group.alb_sg.id
  alb_listener_arn         = aws_lb_listener.main_listener.arn
  priority_offset          = 130
  
  services = [
    {
      name  = "analytics-service"
      port  = 3007
      image = "${var.docker_hub_username}/emotrack-analytics-service"
      path  = "/analytics"
    },
    {
      name  = "goal-service"
      port  = 3008
      image = "${var.docker_hub_username}/emotrack-goal-service"
      path  = "/goals"
    }
  ]
}

# Pair 5: Journal Service (3009) + Recommendation Service (3010)
module "pair_5" {
  source = "./modules/service-pair"
  
  pair_name                = "emotrack-pair-5"
  docker_compose_template  = "${path.module}/modules/microservice/docker-compose-pair-5.tpl"
  vpc_id                   = var.vpc_id
  subnet1                  = var.subnet1
  subnet2                  = var.subnet2
  jwt_secret               = var.jwt_secret
  docker_hub_username      = var.docker_hub_username
  tag                      = var.image_tag
  alb_sg_id                = aws_security_group.alb_sg.id
  alb_listener_arn         = aws_lb_listener.main_listener.arn
  priority_offset          = 140
  
  services = [
    {
      name  = "journal-service"
      port  = 3009
      image = "${var.docker_hub_username}/emotrack-journal-service"
      path  = "/journal"
    },
    {
      name  = "recommendation-service"
      port  = 3010
      image = "${var.docker_hub_username}/emotrack-recommendation-service"
      path  = "/recommendations"
    }
  ]
}

# ============================================================
# MONITORING
# ============================================================

# SNS Topic y Subscription para notificaciones
resource "aws_sns_topic" "asg_alerts" {
  name = "emotrack-asg-alerts-topic"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.asg_alerts.arn
  protocol  = "email"
  endpoint  = "ievinan@uce.edu.ec"
}

# CloudWatch Dashboard para monitoreo
resource "aws_cloudwatch_dashboard" "emotrack_dashboard" {
  dashboard_name = "emotrack-microservices-dashboard"
  dashboard_body = jsonencode({
    widgets = [
      {
        "type" = "metric",
        "x" = 0,
        "y" = 0,
        "width" = 12,
        "height" = 6,
        "properties" = {
          "metrics" = [
            [ "AWS/EC2", "CPUUtilization", "AutoScalingGroupName", module.pair_1.asg_name, { "label": "Pair 1 (API + Auth)" } ],
            [ "...", module.pair_2.asg_name, { "label": "Pair 2 (Emotion + Report)" } ],
            [ "...", module.pair_3.asg_name, { "label": "Pair 3 (Notification + User)" } ],
            [ "...", module.pair_4.asg_name, { "label": "Pair 4 (Analytics + Goal)" } ],
            [ "...", module.pair_5.asg_name, { "label": "Pair 5 (Journal + Recommendation)" } ]
          ],
          "period" = 300,
          "stat" = "Average",
          "region" = var.AWS_REGION,
          "title" = "CPU Utilization by Service Pair"
        }
      },
      {
        "type" = "metric",
        "x" = 12,
        "y" = 0,
        "width" = 12,
        "height" = 6,
        "properties" = {
          "metrics" = [
            [ "AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main_alb.arn_suffix ]
          ],
          "period" = 300,
          "stat" = "Average",
          "region" = var.AWS_REGION,
          "title" = "ALB Response Time"
        }
      },
      {
        "type" = "metric",
        "x" = 0,
        "y" = 6,
        "width" = 24,
        "height" = 6,
        "properties" = {
          "metrics" = [
            [ "AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main_alb.arn_suffix ]
          ],
          "period" = 300,
          "stat" = "Sum",
          "region" = var.AWS_REGION,
          "title" = "Request Count"
        }
      }
    ]
  })
}
