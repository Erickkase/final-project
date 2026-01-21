variable "AWS_REGION" {
  type    = string
  default = "us-east-1"
}

variable "AWS_ACCESS_KEY_ID" {
  type = string
}

variable "AWS_SECRET_ACCESS_KEY" {
  type = string
}

variable "AWS_SESSION_TOKEN" {
  type = string
}

variable "BRANCH_NAME" {
  type    = string
  default = "dev"
}

variable "jwt_secret" {
  description = "Secret para JWT"
  type        = string
}

variable "docker_hub_username" {
  description = "Usuario de Docker Hub"
  type        = string
}

variable "image_tag" {
  description = "Tag de las imágenes Docker (latest o vX.X)"
  type        = string
  default     = "latest"
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
