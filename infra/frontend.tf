provider "aws" {
  region     = var.AWS_REGION
  access_key = var.AWS_ACCESS_KEY_ID
  secret_key = var.AWS_SECRET_ACCESS_KEY
  token      = var.AWS_SESSION_TOKEN
}

# Module for EmoTrack Frontend ONLY (separate infrastructure)
module "emotrack_frontend" {
  source              = "./modules/frontend"
  name                = "emotrack"
  docker_hub_username = var.docker_hub_username
  image_frontend      = "emotrack-frontend"
  port_frontend       = 80
  tag                 = var.image_tag
  branch              = var.BRANCH_NAME
  vpc_id              = var.vpc_id
  subnet1             = var.subnet1
  subnet2             = var.subnet2
  api_base_url        = var.backend_api_url
}

# --- SNS Topic for Frontend alerts ---
resource "aws_sns_topic" "frontend_alerts" {
  name = "frontend-asg-alerts-topic"
}

resource "aws_sns_topic_subscription" "frontend_email" {
  topic_arn = aws_sns_topic.frontend_alerts.arn
  protocol  = "email"
  endpoint  = "ievinan@uce.edu.ec"
}

# --- CloudWatch Alarm for Frontend ASG ---
resource "aws_cloudwatch_metric_alarm" "frontend_asg_high_cpu" {
  alarm_name          = "emotrack-frontend-asg-high-cpu"
  alarm_description   = "High CPU utilization alarm for EmoTrack Frontend ASG"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  statistic           = "Average"
  period              = 120
  dimensions = {
    AutoScalingGroupName = module.emotrack_frontend.asg_name
  }
  comparison_operator = "GreaterThanThreshold"
  threshold           = 80
  evaluation_periods  = 2
  alarm_actions       = [aws_sns_topic.frontend_alerts.arn]
}

# --- CloudWatch Dashboard for Frontend monitoring ---
resource "aws_cloudwatch_dashboard" "frontend_dashboard" {
  dashboard_name = "emotrack-frontend-dashboard"
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
            [ "AWS/EC2", "CPUUtilization", "AutoScalingGroupName", module.emotrack_frontend.asg_name, { "label": "Frontend ASG CPU" } ]
          ],
          "period" = 300,
          "stat" = "Average",
          "region" = var.AWS_REGION,
          "title" = "Frontend ASG CPU Utilization"
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
            [ "AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", module.emotrack_frontend.alb_arn_suffix, { "label": "Frontend ALB Response Time" } ]
          ],
          "period" = 300,
          "stat" = "Average",
          "region" = var.AWS_REGION,
          "title" = "Frontend ALB Response Time"
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
            [ "AWS/ApplicationELB", "HealthyHostCount", "TargetGroup", module.emotrack_frontend.target_group_arn_suffix, { "label": "Frontend Healthy Hosts" } ]
          ],
          "period" = 300,
          "stat" = "Average",
          "region" = var.AWS_REGION,
          "title" = "Frontend Healthy Hosts"
        }
      }
    ]
  })
}
