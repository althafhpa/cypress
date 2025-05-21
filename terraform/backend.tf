terraform {
  backend "s3" {
    bucket         = "terraform-state-cypress-automation"
    key            = "terraform.tfstate"
    region         = "ap-southeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-locks-cypress-automation"
  }
}

# S3 Bucket for Terraform State Storage
resource "aws_s3_bucket" "terraform_state" {
  bucket = "terraform-state-${var.project_name}"

  # Prevent accidental deletion
  force_destroy = false

  tags = merge(var.tags, {
    Name = "${var.project_name}-tf-backend-bucket"
  })

}

# Enable versioning for state files
resource "aws_s3_bucket_versioning" "state_versioning" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "state_encryption" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access to the state bucket
resource "aws_s3_bucket_public_access_block" "state_public_access" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# DynamoDB table for state locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-locks-${var.project_name}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name} Terraform State Locks"
  })
}

# IAM Policy for Terraform Backend Access
resource "aws_iam_policy" "terraform_backend_policy" {
  name        = "terraform-backend-policy-${var.project_name}"
  path        = "/"
  description = "Policy for Terraform backend access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          aws_s3_bucket.terraform_state.arn,
          "${aws_s3_bucket.terraform_state.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DescribeTable",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ]
        Resource = aws_dynamodb_table.terraform_locks.arn
      }
    ]
  })
}

# Example Terraform Backend Configuration (to be used in other Terraform projects)
output "backend_configuration" {
  value = <<-EOT
  # Add this to your other Terraform project's backend configuration
  terraform {
    backend "s3" {
      bucket         = "${aws_s3_bucket.terraform_state.id}"
      key            = "path/to/your/project/terraform.tfstate"
      region         = "${aws_s3_bucket.terraform_state.region}"
      encrypt        = true
      dynamodb_table = "${aws_dynamodb_table.terraform_locks.name}"
    }
  }
  EOT

  sensitive = true
}

# Outputs for reference
output "state_bucket_name" {
  description = "S3 Bucket Name for Terraform State"
  value       = aws_s3_bucket.terraform_state.id
}

output "locks_table_name" {
  description = "DynamoDB Table Name for Terraform Locks"
  value       = aws_dynamodb_table.terraform_locks.name
}