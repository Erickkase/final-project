# ALB Outputs
output "alb_dns_name" {
  description = "DNS del Application Load Balancer"
  value       = aws_lb.main_alb.dns_name
}

output "alb_arn" {
  description = "ARN del ALB"
  value       = aws_lb.main_alb.arn
}

output "alb_zone_id" {
  description = "Zone ID del ALB"
  value       = aws_lb.main_alb.zone_id
}

# Service Pair Outputs
output "pair_1_asg_name" {
  description = "Nombre del ASG del Pair 1 (API Gateway + Auth)"
  value       = module.pair_1.asg_name
}

output "pair_2_asg_name" {
  description = "Nombre del ASG del Pair 2 (Emotion + Report)"
  value       = module.pair_2.asg_name
}

output "pair_3_asg_name" {
  description = "Nombre del ASG del Pair 3 (Notification + User)"
  value       = module.pair_3.asg_name
}

output "pair_4_asg_name" {
  description = "Nombre del ASG del Pair 4 (Analytics + Goal)"
  value       = module.pair_4.asg_name
}

output "pair_5_asg_name" {
  description = "Nombre del ASG del Pair 5 (Journal + Recommendation)"
  value       = module.pair_5.asg_name
}

# Service URLs
output "service_urls" {
  description = "URLs de acceso a los microservicios"
  value = {
    api_gateway          = "http://${aws_lb.main_alb.dns_name}/api"
    auth_service         = "http://${aws_lb.main_alb.dns_name}/auth"
    emotion_service      = "http://${aws_lb.main_alb.dns_name}/emotions"
    report_service       = "http://${aws_lb.main_alb.dns_name}/reports"
    notification_service = "http://${aws_lb.main_alb.dns_name}/notifications"
    user_service         = "http://${aws_lb.main_alb.dns_name}/users"
    analytics_service    = "http://${aws_lb.main_alb.dns_name}/analytics"
    goal_service         = "http://${aws_lb.main_alb.dns_name}/goals"
    journal_service      = "http://${aws_lb.main_alb.dns_name}/journal"
    recommendation_service = "http://${aws_lb.main_alb.dns_name}/recommendations"
  }
}

# CloudWatch Dashboard
output "cloudwatch_dashboard_url" {
  description = "URL del Dashboard de CloudWatch"
  value       = "https://${var.AWS_REGION}.console.aws.amazon.com/cloudwatch/home?region=${var.AWS_REGION}#dashboards:name=${aws_cloudwatch_dashboard.emotrack_dashboard.dashboard_name}"
}

# SNS Topic
output "sns_topic_arn" {
  description = "ARN del SNS Topic para alertas"
  value       = aws_sns_topic.asg_alerts.arn
}
