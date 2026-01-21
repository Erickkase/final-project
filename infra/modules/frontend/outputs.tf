# Frontend Infrastructure Outputs

output "alb_dns_name" {
  description = "DNS name of the frontend ALB"
  value       = aws_lb.frontend_alb.dns_name
}

output "alb_arn" {
  description = "ARN of the frontend ALB"
  value       = aws_lb.frontend_alb.arn
}

output "alb_arn_suffix" {
  description = "ARN suffix of the frontend ALB for CloudWatch"
  value       = aws_lb.frontend_alb.arn_suffix
}

output "asg_name" {
  description = "Name of the frontend Auto Scaling Group"
  value       = aws_autoscaling_group.frontend_asg.name
}

output "security_group_id" {
  description = "ID of the frontend security group"
  value       = aws_security_group.frontend_sg.id
}

output "target_group_arn" {
  description = "ARN of the frontend target group"
  value       = aws_lb_target_group.frontend_tg.arn
}

output "target_group_arn_suffix" {
  description = "ARN suffix of the frontend target group for CloudWatch"
  value       = aws_lb_target_group.frontend_tg.arn_suffix
}
