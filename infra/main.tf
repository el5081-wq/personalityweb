

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ── Variables ────────────────────────────────────────────────────────────────
variable "aws_region" {
  description = "AWS region to deploy into"
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name"
  default     = "personalityweb"
}

# ── Security Group ───────────────────────────────────────────────────────────
resource "aws_security_group" "app_sg" {
  name        = "${var.app_name}-sg"
  description = "Allow HTTP and SSH traffic"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "App port"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.app_name}-sg" }
}

# ── EC2 Instance (Free Tier) ─────────────────────────────────────────────────
resource "aws_instance" "app" {
  ami                    = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS us-east-1
  instance_type          = "t3.micro"              # Free tier eligible
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  key_name               = var.app_name

  tags = { Name = "${var.app_name}-server" }
}

# ── S3 Bucket for logs and backups (Free Tier: 5GB) ─────────────────────────
resource "aws_s3_bucket" "logs" {
  bucket        = "${var.app_name}-logs"
  force_destroy = true

  tags = { Name = "${var.app_name}-logs" }
}

resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id
  versioning_configuration { status = "Enabled" }
}

# Auto-delete logs older than 30 days to stay in free tier
resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"
    filter {}
    expiration { days = 30 }
  }
}

# ── Outputs ──────────────────────────────────────────────────────────────────
output "server_ip" {
  description = "Public IP of the app server"
  value       = aws_instance.app.public_ip
}

output "s3_log_bucket" {
  description = "S3 bucket name for logs and backups"
  value       = aws_s3_bucket.logs.bucket
}
