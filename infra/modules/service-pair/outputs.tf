output "asg_name" {
  description = "Nombre del Auto Scaling Group"
  value       = aws_autoscaling_group.asg.name
}

output "asg_arn" {
  description = "ARN del Auto Scaling Group"
  value       = aws_autoscaling_group.asg.arn
}

output "target_group_arns" {
  description = "ARNs de los Target Groups"
  value       = { for name, tg in aws_lb_target_group.tg : name => tg.arn }
}

output "target_group_arn_suffixes" {
  description = "ARN suffixes de los Target Groups"
  value       = { for name, tg in aws_lb_target_group.tg : name => tg.arn_suffix }
}

output "security_group_id" {
  description = "ID del Security Group"
  value       = aws_security_group.sg.id
}
