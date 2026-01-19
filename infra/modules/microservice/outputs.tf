output "asg_name" {
  description = "Nombre del Auto Scaling Group"
  value       = aws_autoscaling_group.asg.name
}

output "alb_dns_name" {
  description = "DNS name del Application Load Balancer"
  value       = aws_lb.alb.dns_name
}

output "alb_arn" {
  description = "ARN del Application Load Balancer"
  value       = aws_lb.alb.arn
}

output "alb_arn_suffix" {
  description = "ARN suffix del ALB para CloudWatch"
  value       = aws_lb.alb.arn_suffix
}

output "tg_api_gateway_arn" {
  description = "ARN del Target Group de API Gateway"
  value       = aws_lb_target_group.tg_api_gateway.arn
}

output "tg_api_gateway_arn_suffix" {
  description = "ARN suffix del TG API Gateway para CloudWatch"
  value       = aws_lb_target_group.tg_api_gateway.arn_suffix
}

output "tg_auth_service_arn" {
  description = "ARN del Target Group de Auth Service"
  value       = aws_lb_target_group.tg_auth_service.arn
}

output "tg_auth_service_arn_suffix" {
  description = "ARN suffix del TG Auth Service para CloudWatch"
  value       = aws_lb_target_group.tg_auth_service.arn_suffix
}

output "tg_emotion_service_arn" {
  description = "ARN del Target Group de Emotion Service"
  value       = aws_lb_target_group.tg_emotion_service.arn
}

output "tg_emotion_service_arn_suffix" {
  description = "ARN suffix del TG Emotion Service para CloudWatch"
  value       = aws_lb_target_group.tg_emotion_service.arn_suffix
}

output "security_group_id" {
  description = "ID del Security Group"
  value       = aws_security_group.sg.id
}
