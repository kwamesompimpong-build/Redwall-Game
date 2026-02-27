variable "aws_region" {
  description = "AWS region to deploy the Redwall game server"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type — t2.micro is free-tier eligible"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of an existing EC2 key pair for SSH access (leave empty to disable SSH key auth)"
  type        = string
  default     = ""
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH into the instance (e.g. your IP: x.x.x.x/32)"
  type        = string
  default     = "0.0.0.0/0"
}
