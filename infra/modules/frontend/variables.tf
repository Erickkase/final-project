# Frontend Infrastructure Variables

variable "name" {
  description = "Name prefix for frontend resources"
  type        = string
}

variable "docker_hub_username" {
  description = "Docker Hub username"
  type        = string
}

variable "image_frontend" {
  description = "Docker image for frontend"
  type        = string
}

variable "port_frontend" {
  description = "Port for frontend service"
  type        = number
  default     = 80
}

variable "tag" {
  description = "Docker image tag"
  type        = string
}

variable "branch" {
  description = "Branch name for environment"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet1" {
  description = "Subnet ID 1"
  type        = string
}

variable "subnet2" {
  description = "Subnet ID 2"
  type        = string
}

variable "api_base_url" {
  description = "Backend API base URL (ALB DNS of microservices)"
  type        = string
}
