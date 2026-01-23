# Frontend Infrastructure Outputs

output "frontend_alb_dns" {
  description = "DNS del Load Balancer del Frontend"
  value       = module.emotrack_frontend.alb_dns_name
}

output "frontend_asg_name" {
  description = "Nombre del Auto Scaling Group del Frontend"
  value       = module.emotrack_frontend.asg_name
}

output "frontend_url" {
  description = "URL del Frontend Application"
  value       = "http://${module.emotrack_frontend.alb_dns_name}"
}

output "frontend_alb_arn" {
  description = "ARN del Frontend ALB"
  value       = module.emotrack_frontend.alb_arn
}

output "frontend_security_group_id" {
  description = "ID del Security Group del Frontend"
  value       = module.emotrack_frontend.security_group_id
}

output "cloudwatch_frontend_dashboard_url" {
  description = "URL del dashboard de CloudWatch del Frontend"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.AWS_REGION}#dashboards:name=emotrack-frontend-dashboard"
}
