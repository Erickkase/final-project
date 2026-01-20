# Security Group para los microservicios
resource "aws_security_group" "sg" {
  name_prefix = "${var.name}-sg"
  vpc_id      = var.vpc_id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Puertos de los microservicios (3001-3003)
  ingress {
    from_port   = 3001
    to_port     = 3003
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
    Name = "${var.name}-sg"
  }
}

# SSH Key Pair
resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "key" {
  key_name   = "${var.name}-key"
  public_key = tls_private_key.ssh_key.public_key_openssh
}

# Launch Template
resource "aws_launch_template" "lt" {
  name_prefix   = "${var.name}-lt"
  image_id      = var.ami_id
  instance_type = "t2.micro"
  key_name      = aws_key_pair.key.key_name
  vpc_security_group_ids = [aws_security_group.sg.id]
  
  user_data = base64encode(templatefile("${path.module}/docker-compose.tpl", {
    image_auth_service    = var.image_auth_service
    port_auth_service     = var.port_auth_service
    image_emotion_service = var.image_emotion_service
    port_emotion_service  = var.port_emotion_service
    image_report_service  = var.image_report_service
    port_report_service   = var.port_report_service
    image_frontend        = var.image_frontend
    port_frontend         = var.port_frontend
    tag                   = var.tag
    jwt_secret            = var.jwt_secret
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.name}-instance"
    }
  }
}

# Application Load Balancer
resource "aws_lb" "alb" {
  name               = "${var.name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sg.id]
  subnets            = [var.subnet1, var.subnet2]

  tags = {
    Name = "${var.name}-alb"
  }
}

# Target Group - Auth Service
resource "aws_lb_target_group" "tg_auth_service" {
  name     = "${var.name}-auth-service-tg"
  port     = var.port_auth_service
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
    Name = "${var.name}-auth-service-tg"
  }
}

# Target Group - Emotion Service
resource "aws_lb_target_group" "tg_emotion_service" {
  name     = "${var.name}-emotion-svc-tg"
  port     = var.port_emotion_service
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
    Name = "${var.name}-emotion-service-tg"
  }
}

# Target Group - Report Service
resource "aws_lb_target_group" "tg_report_service" {
  name     = "${var.name}-report-svc-tg"
  port     = var.port_report_service
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
    Name = "${var.name}-report-service-tg"
  }
}

# ALB Listener (puerto 80)
resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_lb.alb.arn
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

# Listener Rule - Auth Service
resource "aws_lb_listener_rule" "rule_auth" {
  listener_arn = aws_lb_listener.listener.arn
  priority     = 100
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_auth_service.arn
  }
  
  condition {
    path_pattern {
      values = ["/auth*"]
    }
  }
}

# Listener Rule - Emotion Service
resource "aws_lb_listener_rule" "rule_emotion" {
  listener_arn = aws_lb_listener.listener.arn
  priority     = 101
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_emotion_service.arn
  }
  
  condition {
    path_pattern {
      values = ["/emotions*"]
    }
  }
}

# Listener Rule - Report Service
resource "aws_lb_listener_rule" "rule_report" {
  listener_arn = aws_lb_listener.listener.arn
  priority     = 102
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_report_service.arn
  }
  
  condition {
    path_pattern {
      values = ["/reports*"]
    }
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "asg" {
  name                 = "${var.name}-asg"
  desired_capacity     = 3
  max_size             = 6
  min_size             = 3
  vpc_zone_identifier  = [var.subnet1, var.subnet2]
  
  target_group_arns = [
    aws_lb_target_group.tg_auth_service.arn,
    aws_lb_target_group.tg_emotion_service.arn,
    aws_lb_target_group.tg_report_service.arn
  ]
  
  launch_template {
    id      = aws_launch_template.lt.id
    version = "$Latest"
  }

  health_check_type         = "ELB"
  health_check_grace_period = 300

  tag {
    key                 = "Name"
    value               = "${var.name}-asg-instance"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Policy - Scale Up
resource "aws_autoscaling_policy" "scale_up" {
  name                   = "${var.name}-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.asg.name
}

# Auto Scaling Policy - Scale Down
resource "aws_autoscaling_policy" "scale_down" {
  name                   = "${var.name}-scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.asg.name
}

# CloudWatch Alarm - High CPU (Scale Up)
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.name}-high-cpu"
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
  alarm_name          = "${var.name}-low-cpu"
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
