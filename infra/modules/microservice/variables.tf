variable "name" {
  description = "Nombre del proyecto"
  type        = string
}

variable "branch" {
  description = "Rama actual (dev, qa, main)"
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

variable "image_auth_service" {
  description = "Imagen Docker para Auth Service"
  type        = string
}

variable "port_auth_service" {
  description = "Puerto para Auth Service"
  type        = number
  default     = 3001
}

variable "image_emotion_service" {
  description = "Imagen Docker para Emotion Service"
  type        = string
}

variable "port_emotion_service" {
  description = "Puerto para Emotion Service"
  type        = number
  default     = 3002
}

variable "image_report_service" {
  description = "Imagen Docker para Report Service"
  type        = string
}

variable "port_report_service" {
  description = "Puerto para Report Service"
  type        = number
  default     = 3003
}

variable "tag" {
  description = "Tag de Docker para todas las imágenes"
  type        = string
  default     = "latest"
}
