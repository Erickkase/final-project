# Security Group para este par de servicios
resource "aws_security_group" "sg" {
  name_prefix = "${var.pair_name}-sg"
  vpc_id      = var.vpc_id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Permitir tráfico desde el ALB
  dynamic "ingress" {
    for_each = var.services
    content {
      from_port       = ingress.value.port
      to_port         = ingress.value.port
      protocol        = "tcp"
      security_groups = [var.alb_sg_id]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.pair_name}-sg"
  }
}

# SSH Key Pair
resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "key" {
  key_name   = "${var.pair_name}-key"
  public_key = tls_private_key.ssh_key.public_key_openssh
}

# Launch Template
resource "aws_launch_template" "lt" {
  name_prefix   = "${var.pair_name}-lt"
  image_id      = var.ami_id
  instance_type = "t2.micro"
  key_name      = aws_key_pair.key.key_name
  vpc_security_group_ids = [aws_security_group.sg.id]
  
  user_data = base64encode(templatefile(var.docker_compose_template, merge(
    {
      jwt_secret = var.jwt_secret
      tag        = var.tag
    },
    { for service in var.services : "image_${replace(service.name, "-", "_")}" => service.image }
  )))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.pair_name}-instance"
    }
  }
}

# Target Groups
resource "aws_lb_target_group" "tg" {
  for_each = { for service in var.services : service.name => service }
  
  name     = "${var.pair_name}-${substr(each.value.name, 0, 15)}-tg"
  port     = each.value.port
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  
  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "${var.pair_name}-${each.value.name}-tg"
  }
}

# Listener Rules
resource "aws_lb_listener_rule" "rule" {
  for_each = { for idx, service in var.services : service.name => {
    service  = service
    priority = var.priority_offset + idx
  }}
  
  listener_arn = var.alb_listener_arn
  priority     = each.value.priority
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg[each.key].arn
  }
  
  condition {
    path_pattern {
      values = ["${each.value.service.path}*"]
    }
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "asg" {
  name                 = "${var.pair_name}-asg"
  desired_capacity     = 2
  max_size             = 4
  min_size             = 2
  vpc_zone_identifier  = [var.subnet1, var.subnet2]
  
  target_group_arns = [for tg in aws_lb_target_group.tg : tg.arn]
  
  launch_template {
    id      = aws_launch_template.lt.id
    version = "$Latest"
  }

  health_check_type         = "ELB"
  health_check_grace_period = 300

  tag {
    key                 = "Name"
    value               = "${var.pair_name}-asg-instance"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Policy - Scale Up
resource "aws_autoscaling_policy" "scale_up" {
  name                   = "${var.pair_name}-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.asg.name
}

# Auto Scaling Policy - Scale Down
resource "aws_autoscaling_policy" "scale_down" {
  name                   = "${var.pair_name}-scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.asg.name
}

# CloudWatch Alarm - High CPU (Scale Up)
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.pair_name}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 70
  alarm_description   = "Scale up if CPU > 70%"
  alarm_actions       = [aws_autoscaling_policy.scale_up.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.asg.name
  }
}

# CloudWatch Alarm - Low CPU (Scale Down)
resource "aws_cloudwatch_metric_alarm" "low_cpu" {
  alarm_name          = "${var.pair_name}-low-cpu"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 30
  alarm_description   = "Scale down if CPU < 30%"
  alarm_actions       = [aws_autoscaling_policy.scale_down.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.asg.name
  }
}
