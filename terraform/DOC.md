Overview of Files

1. terraform/.terraform.lock.hcl

A lock file automatically maintained by Terraform


Tracks AWS provider version 5.77.0

Ensures consistent provider versions across environments

2. terraform/backend.tf

Configures S3 backend for Terraform state storage

Creates infrastructure for state management:

S3 bucket: terraform-state-cypress-automation

DynamoDB table: terraform-state-locks-cypress-automation

IAM policy for backend access

Implements security features like encryption and public access blocking

3. terraform/error.html

404 error page template for the S3 static website

Styled with red/pink error theme

Contains error information and a link back to homepage

4. terraform/index.html

Main page template for the S3 static website

Success message confirming S3 hosting

Suggestions for next steps (CloudFront, custom domain)

5. terraform/main.tf

Core infrastructure configuration:

S3 bucket for website hosting

Website configuration (index/error documents)

Public access settings

Bucket policy for public read access

CORS configuration


CloudFront distribution for CDN

6. terraform/variables.tf

Defines variables used across the Terraform configuration:
p
roject_name: Default is "cypress-automation"

tags: Default AWS resource tags including contact information and project details

Configuration That Needs to Be Updated

AWS Region:

Currently hardcoded to ap-southeast-2 in main.tf

Consider moving to variables.tf for flexibility

S3 Bucket Names:

Both website bucket and state bucket use project_name variable

Ensure uniqueness if deploying to different environments

CloudFront Configuration:

Using default CloudFront certificate

Consider adding custom certificate for production

Force Destroy Settings:

Both buckets have force_destroy = false

May need to be true for test environments

Tags:

Default tags contain placeholder information

Update with actual project details
