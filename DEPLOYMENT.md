# JewelCart Deployment Guide

## Quick Start

### Local Deployment

1. Copy the environment template:
```bash
cp .env.production .env
# Edit .env with your values
```

2. Start the application:
```bash
docker-compose up -d --build
```

3. Access the app:
- Frontend: http://localhost
- API: http://localhost:3000

## AWS Deployment

### Prerequisites
- AWS CLI installed and configured
- Docker installed
- ECR repository created

### Step 1: Create Infrastructure

```bash
# Create ECR repository
aws ecr create-repository --repository-name jewelcart

# Deploy CloudFormation stack
aws cloudformation deploy \
  --template-file aws/cloudformation-template.yaml \
  --stack-name jewelcart-infrastructure \
  --parameter-overrides Environment=production \
  DBPassword=your_secure_password \
  JWTSecret=your_jwt_secret \
  RazorpayKeyId=your_key \
  RazorpayKeySecret=your_secret \
  AdminPassword=your_admin_password
```

### Step 2: Build and Push Image

```bash
# Option 1: Using the deployment script
export AWS_ACCOUNT_ID=your_account_id
./deploy.sh aws

# Option 2: Manual
docker build -t jewelcart:latest .
docker tag jewelcart:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jewelcart:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/jewelcart:latest
```

### Step 3: Deploy to ECS

1. Create ECS service using the AWS Console or CLI
2. Use the task definition in `aws/ecs-task-definition.json`
3. Update the image URI to your ECR image

### Step 4: Configure Environment Variables

Update the ECS task definition with your secrets from AWS Secrets Manager.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| JWT_SECRET | Secret key for JWT tokens | Yes |
| JWT_EXPIRES_IN | JWT token expiry | No (default: 7d) |
| RAZORPAY_KEY_ID | Razorpay key ID | For payments |
| RAZORPAY_KEY_SECRET | Razorpay key secret | For payments |
| STRIPE_SECRET_KEY | Stripe secret key | For payments |
| GOKWIK_API_KEY | Gokwik API key | For payments |
| IMAGE_BASE_URL | Base URL for images (leave empty for relative paths, or set to your domain for absolute URLs) | No (default: empty) |
| FRONTEND_URL | Frontend URL | Yes |
| ADMIN_EMAIL | Admin email | Yes |
| ADMIN_PASSWORD | Admin password | Yes |

## Production Checklist

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Configure backup for RDS
- [ ] Use AWS Secrets Manager for sensitive data
- [ ] Set up CI/CD pipeline
