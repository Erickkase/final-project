provider "aws" {
  region     = var.AWS_REGION
  access_key = var.AWS_ACCESS_KEY_ID
  secret_key = var.AWS_SECRET_ACCESS_KEY
  token      = var.AWS_SESSION_TOKEN
}

# Módulo para los microservicios de EmoTrack
module "emotrack_microservices" {
  source               = "./modules/microservice"
  name                 = "emotrack"
  docker_hub_username  = var.docker_hub_username
  image_auth_service   = "${var.docker_hub_username}/emotrack-auth-service"
  port_auth_service    = 3001
  image_emotion_service = "${var.docker_hub_username}/emotrack-emotion-service"
  port_emotion_service = 3002
  image_report_service = "${var.docker_hub_username}/emotrack-report-service"
  port_report_service  = 3003
  tag                  = var.image_tag
  branch               = var.BRANCH_NAME
  jwt_secret           = var.jwt_secret
  vpc_id               = var.vpc_id
  subnet1              = var.subnet1
  subnet2              = var.subnet2
}

# --- SNS Topic y Subscription para notificaciones ---
resource "aws_sns_topic" "asg_alerts" {
  name = "asg-alerts-topic"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.asg_alerts.arn
  protocol  = "email"
  endpoint  = "ievinan@uce.edu.ec"
}

# --- CloudWatch Alarm para el Auto Scaling Group ---
resource "aws_cloudwatch_metric_alarm" "asg_high_cpu" {
  alarm_name          = "emotrack-asg-high-cpu-utilization"
  alarm_description   = "High CPU utilization alarm for EmoTrack ASG"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  statistic           = "Average"
  period              = 120
  dimensions = {
    AutoScalingGroupName = module.emotrack_microservices.asg_name
  }
  comparison_operator = "GreaterThanThreshold"
  threshold           = 80
  evaluation_periods  = 2
  alarm_actions       = [aws_sns_topic.asg_alerts.arn]
}

# --- CloudWatch Dashboard para monitoreo ---
resource "aws_cloudwatch_dashboard" "emotrack_dashboard" {
  dashboard_name = "emotrack-dashboard"
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
            [ "AWS/EC2", "CPUUtilization", "AutoScalingGroupName", module.emotrack_microservices.asg_name ]
          ],
          "period" = 300,
          "stat" = "Average",
          "region" = var.AWS_REGION,
          "title" = "EmoTrack ASG CPU Utilization"
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
            [ "AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", module.emotrack_microservices.alb_arn_suffix ]
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
            [ "AWS/ApplicationELB", "HealthyHostCount", "TargetGroup", module.emotrack_microservices.tg_auth_service_arn_suffix ],
            [ "...", module.emotrack_microservices.tg_emotion_service_arn_suffix ],
            [ "...", module.emotrack_microservices.tg_report_service_arn_suffix ]
          ],
          "period" = 300,
          "stat" = "Average",
          "region" = var.AWS_REGION,
          "title" = "Healthy Hosts per Service"
        }
      }
    ]
  })
}