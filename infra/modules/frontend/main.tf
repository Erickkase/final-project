# Frontend Infrastructure Module
# Separate infrastructure for frontend with its own ALB, ASG, and resources

# Security Group for Frontend
resource "aws_security_group" "frontend_sg" {
  name_prefix = "${var.name}-frontend-sg"
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

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
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
    Name = "${var.name}-frontend-sg"
  }
}

# SSH Key Pair for Frontend
resource "tls_private_key" "frontend_ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "frontend_key" {
  key_name   = "${var.name}-frontend-key"
  public_key = tls_private_key.frontend_ssh_key.public_key_openssh

  tags = {
    Name = "${var.name}-frontend-key"
  }
}

# Application Load Balancer for Frontend
resource "aws_lb" "frontend_alb" {
  name               = "${var.name}-frontend-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.frontend_sg.id]
  subnets            = [var.subnet1, var.subnet2]

  enable_deletion_protection = false
  enable_http2               = true

  tags = {
    Name        = "${var.name}-frontend-alb"
    Environment = var.branch
  }
}

# Target Group for Frontend
resource "aws_lb_target_group" "frontend_tg" {
  name     = "${var.name}-frontend-tg"
  port     = var.port_frontend
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200,301,302"
  }

  deregistration_delay = 30

  tags = {
    Name = "${var.name}-frontend-tg"
  }
}

# ALB Listener for Frontend (HTTP)
resource "aws_lb_listener" "frontend_http" {
  load_balancer_arn = aws_lb.frontend_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }
}

# User Data Script for Frontend EC2 Instances
locals {
  frontend_user_data = <<-EOF
    #!/bin/bash
    set -e
    
    # Log all output to file
    exec > >(tee /var/log/user-data.log)
    exec 2>&1
    
    echo "=== Starting Frontend Instance Setup ==="
    echo "Timestamp: $(date)"
    
    # Update system
    echo "Updating system packages..."
    yum update -y
    
    # Install Docker
    echo "Installing Docker..."
    amazon-linux-extras install docker -y
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
    
    # Install Docker Compose
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Verify Docker is running
    docker --version
    docker-compose --version
    
    # Create app directory
    echo "Setting up application directory..."
    mkdir -p /opt/emotrack-frontend
    cd /opt/emotrack-frontend
    
    # Create docker-compose.yml
    echo "Creating docker-compose configuration..."
    cat > docker-compose.yml <<'COMPOSE'
    version: '3.8'
    
    services:
      frontend:
        image: ${var.docker_hub_username}/${var.image_frontend}:${var.tag}
        container_name: emotrack-frontend
        ports:
          - "80:80"
        environment:
          - NODE_ENV=production
          - API_BASE_URL=${var.api_base_url}
        restart: unless-stopped
        healthcheck:
          test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/"]
          interval: 30s
          timeout: 10s
          retries: 3
          start_period: 40s
    COMPOSE
    
    # Pull and start containers
    echo "Pulling Docker image..."
    docker-compose pull
    
    echo "Starting frontend container..."
    docker-compose up -d
    
    # Wait for container to be healthy
    echo "Waiting for container to be healthy..."
    sleep 10
    
    # Verify container is running
    docker ps -a
    
    # Test health endpoint
    echo "Testing health endpoint..."
    for i in {1..30}; do
      if curl -f http://localhost:80/ > /dev/null 2>&1; then
        echo "✅ Frontend is responding!"
        break
      fi
      echo "Waiting for frontend to be ready... ($i/30)"
      sleep 2
    done
    
    # Setup log rotation
    cat > /etc/logrotate.d/docker-frontend <<'LOGROTATE'
    /var/lib/docker/containers/*/*.log {
      rotate 7
      daily
      compress
      missingok
      delaycompress
      copytruncate
    }
    LOGROTATE
    
    echo "=== Frontend deployment completed successfully! ==="
    echo "Timestamp: $(date)"
  EOF
}

# Launch Template for Frontend
resource "aws_launch_template" "frontend_lt" {
  name_prefix   = "${var.name}-frontend-lt"
  image_id      = var.ami_id
  instance_type = "t2.micro"
  key_name      = aws_key_pair.frontend_key.key_name

  vpc_security_group_ids = [aws_security_group.frontend_sg.id]

  user_data = base64encode(local.frontend_user_data)

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.name}-frontend-instance"
      Environment = var.branch
      Type        = "Frontend"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Group for Frontend
resource "aws_autoscaling_group" "frontend_asg" {
  name                = "${var.name}-frontend-asg"
  vpc_zone_identifier = [var.subnet1, var.subnet2]
  target_group_arns   = [aws_lb_target_group.frontend_tg.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  min_size         = 2
  max_size         = 6
  desired_capacity = 2

  launch_template {
    id      = aws_launch_template.frontend_lt.id
    version = "$Latest"
  }

  enabled_metrics = [
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupMaxSize",
    "GroupMinSize",
    "GroupPendingInstances",
    "GroupStandbyInstances",
    "GroupTerminatingInstances",
    "GroupTotalInstances"
  ]

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
      instance_warmup        = 300
    }
  }

  tag {
    key                 = "Name"
    value               = "${var.name}-frontend-asg"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.branch
    propagate_at_launch = true
  }

  tag {
    key                 = "Type"
    value               = "Frontend"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Policies for Frontend
resource "aws_autoscaling_policy" "frontend_scale_up" {
  name                   = "${var.name}-frontend-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.frontend_asg.name
}

resource "aws_autoscaling_policy" "frontend_scale_down" {
  name                   = "${var.name}-frontend-scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.frontend_asg.name
}

# CloudWatch Alarms for Frontend Auto Scaling
resource "aws_cloudwatch_metric_alarm" "frontend_cpu_high" {
  alarm_name          = "${var.name}-frontend-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "70"
  alarm_description   = "This metric monitors frontend CPU utilization"
  alarm_actions       = [aws_autoscaling_policy.frontend_scale_up.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.frontend_asg.name
  }
}

resource "aws_cloudwatch_metric_alarm" "frontend_cpu_low" {
  alarm_name          = "${var.name}-frontend-cpu-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "30"
  alarm_description   = "This metric monitors frontend CPU utilization"
  alarm_actions       = [aws_autoscaling_policy.frontend_scale_down.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.frontend_asg.name
  }
}
