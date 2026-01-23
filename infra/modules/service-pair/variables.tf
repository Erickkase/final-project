variable "pair_name" {
  description = "Nombre del par de servicios (ej: pair-1, pair-2, etc)"
  type        = string
}

variable "docker_compose_template" {
  description = "Path al template de docker-compose para este par"
  type        = string
}

variable "vpc_id" {
  type        = string
  description = "VPC ID para los recursos"
}

variable "subnet1" {
  type        = string
  description = "ID de la primera subnet"
}

variable "subnet2" {
  type        = string
  description = "ID de la segunda subnet"
}

variable "ami_id" {
  type    = string
  default = "ami-020cba7c55df1f615"
  description = "AMI de Ubuntu con Docker"
}

variable "jwt_secret" {
  description = "Secret para JWT"
  type        = string
  sensitive   = true
}

variable "docker_hub_username" {
  description = "Usuario de Docker Hub"
  type        = string
}

variable "tag" {
  description = "Tag de la imagen Docker"
  type        = string
  default     = "latest"
}

variable "services" {
  description = "Lista de servicios en este par"
  type = list(object({
    name  = string
    port  = number
    image = string
    path  = string
  }))
}

variable "alb_sg_id" {
  description = "Security Group ID del ALB compartido"
  type        = string
}

variable "alb_listener_arn" {
  description = "ARN del listener del ALB compartido"
  type        = string
}

variable "priority_offset" {
  description = "Offset para las prioridades de las reglas del ALB"
  type        = number
}
