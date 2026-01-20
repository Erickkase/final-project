output "emotrack_alb_dns" {
  description = "DNS del Load Balancer de EmoTrack (Microservices)"
  value       = module.emotrack_microservices.alb_dns_name
}

output "emotrack_asg_name" {
  description = "Nombre del Auto Scaling Group (Microservices)"
  value       = module.emotrack_microservices.asg_name
}

output "api_gateway_url" {
  description = "URL del API Gateway (Backend Services)"
  value       = "http://${module.emotrack_microservices.alb_dns_name}"
}

output "auth_service_url" {
  description = "URL del Auth Service"
  value       = "http://${module.emotrack_microservices.alb_dns_name}/auth"
}

output "emotion_service_url" {
  description = "URL del Emotion Service"
  value       = "http://${module.emotrack_microservices.alb_dns_name}/emotions"
}

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

output "cloudwatch_dashboard_url" {
  description = "URL del dashboard de CloudWatch"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.AWS_REGION}#dashboards:name=emotrack-dashboard"
}
