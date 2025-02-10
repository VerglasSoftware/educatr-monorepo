#!/bin/bash

set -e  # Exit immediately if a command fails

# Function to clean up resources in case of early termination (Ctrl+C)
cleanup() {
    echo "Cleaning up resources..."

    # Terminate EC2 instance
    if [ -n "$INSTANCE_ID" ]; then
        echo "Terminating EC2 instance $INSTANCE_ID..."
        aws ec2 terminate-instances --region $AWS_REGION --instance-ids "$INSTANCE_ID" > /dev/null
        aws ec2 wait instance-terminated --region $AWS_REGION --instance-ids "$INSTANCE_ID"
    fi

    # Delete security group if created
    if [ -n "$SECURITY_GROUP" ]; then
        echo "Deleting security group $SECURITY_GROUP..."
        aws ec2 delete-security-group --region $AWS_REGION --group-id "$SECURITY_GROUP" > /dev/null
    fi

    # Delete key pair if created
    if [ -f "$KEY_FILE" ]; then
        echo "Deleting key pair $KEY_NAME..."
        aws ec2 delete-key-pair --region $AWS_REGION --key-name "$KEY_NAME" > /dev/null
        rm -f "$KEY_FILE"
    fi

    # Delete subnet if created
    if [ -n "$SUBNET_ID" ]; then
        echo "Deleting subnet $SUBNET_ID..."
        aws ec2 delete-subnet --region $AWS_REGION --subnet-id "$SUBNET_ID" > /dev/null
    fi

    echo "Cleanup completed."
}

# Register cleanup to run on script exit (Ctrl+C or normal exit)
trap cleanup EXIT

# Load environment variables from .env and export them
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found!"
    exit 1
fi

# Validate AWS CLI setup
if ! aws sts get-caller-identity &>/dev/null; then
    echo "AWS CLI not configured properly. Run 'aws configure'."
    exit 1
fi

# Set region to eu-west-1
AWS_REGION="eu-west-1"

# Get the latest Amazon Linux 2 AMI ID for the selected region
AMI_ID=ami-03fd334507439f4d1

echo "Using AMI ID: $AMI_ID"

# Check if key pair exists
KEY_NAME="test-key-pair3"
KEY_FILE="./${KEY_NAME}.pem"

if ! aws ec2 describe-key-pairs --region $AWS_REGION --key-name "$KEY_NAME" &>/dev/null; then
    echo "Key pair $KEY_NAME not found. Creating a new key pair..."
    aws ec2 create-key-pair --region $AWS_REGION --key-name "$KEY_NAME" --query "KeyMaterial" --output text > "$KEY_FILE"
    chmod 400 "$KEY_FILE"  # Make the private key file secure
else
    echo "Key pair $KEY_NAME found."
fi

# Check if security group exists
SECURITY_GROUP_NAME="test-sg"
SECURITY_GROUP=$(aws ec2 describe-security-groups \
    --region $AWS_REGION \
    --filters Name=group-name,Values="$SECURITY_GROUP_NAME" \
    --query "SecurityGroups[0].GroupId" \
    --output text)

echo "Security Group lookup result: $SECURITY_GROUP"

if [ "$SECURITY_GROUP" == "None" ] || [ -z "$SECURITY_GROUP" ]; then
    echo "Security group $SECURITY_GROUP_NAME not found. Creating a new security group..."
    SECURITY_GROUP=$(aws ec2 create-security-group \
        --region $AWS_REGION \
        --group-name "$SECURITY_GROUP_NAME" \
        --description "Test security group for SSH access" \
        --query "GroupId" \
        --output text)
    
    echo "Security Group ID created: $SECURITY_GROUP"
    
    echo "Authorizing SSH access for security group $SECURITY_GROUP_NAME..."
    aws ec2 authorize-security-group-ingress \
        --region $AWS_REGION \
        --group-id "$SECURITY_GROUP" \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0  # Allow SSH access from anywhere
else
    echo "Security group $SECURITY_GROUP_NAME found with ID: $SECURITY_GROUP."
fi

# Check if subnet exists (fetch default VPC subnet)
SUBNET_ID=$(aws ec2 describe-subnets \
    --region $AWS_REGION \
    --filters Name=default-for-az,Values=true \
    --query "Subnets[0].SubnetId" \
    --output text)

echo "Using Subnet ID: $SUBNET_ID"

if [ "$SUBNET_ID" == "None" ]; then
    echo "No default subnet found. Creating a new subnet..."
    VPC_ID=$(aws ec2 describe-vpcs \
        --region $AWS_REGION \
        --filters Name=isDefault,Values=true \
        --query "Vpcs[0].VpcId" \
        --output text)
    
    SUBNET_ID=$(aws ec2 create-subnet \
        --region $AWS_REGION \
        --vpc-id "$VPC_ID" \
        --cidr-block "10.0.0.0/24" \
        --availability-zone "${AWS_REGION}a" \
        --query "Subnet.SubnetId" \
        --output text)
    echo "Created subnet $SUBNET_ID in VPC $VPC_ID."
else
    echo "Using existing subnet $SUBNET_ID."
fi

echo "Using the following configuration:"
echo "AMI ID: $AMI_ID"
echo "Key Name: $KEY_NAME"
echo "Security Group ID: $SECURITY_GROUP"
echo "Subnet ID: $SUBNET_ID"

# Launch EC2 instance with the dynamically fetched parameters
echo "Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --region $AWS_REGION \
    --image-id "$AMI_ID" \
    --count 1 \
    --instance-type "r5.4xlarge" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SECURITY_GROUP" \
    --subnet-id "$SUBNET_ID" \
    --query "Instances[0].InstanceId" \
    --block-device-mappings '[{"DeviceName": "/dev/sda1","Ebs":{"VolumeSize":100,"DeleteOnTermination":true}}]' \
    --output text)

echo "Instance $INSTANCE_ID launched. Waiting for it to initialize..."

# Wait until instance is running
aws ec2 wait instance-running --region $AWS_REGION --instance-ids "$INSTANCE_ID"
PUBLIC_IP=$(aws ec2 describe-instances --region $AWS_REGION --instance-ids "$INSTANCE_ID" --query "Reservations[0].Instances[0].PublicIpAddress" --output text)

echo "Instance is running at $PUBLIC_IP. Waiting for SSH access..."
sleep 20  # Allow some time for SSH to be ready

# Clone the repository from GitHub and install Node.js using nvm
echo "Cloning the GitHub repository..."
ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" "ubuntu@$PUBLIC_IP" <<EOF
    # Install git
    sudo yum install -y git

    # Install nvm (Node Version Manager)
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # Activate nvm
    export NVM_DIR="\$HOME/.nvm"
    [ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

    # Install Node.js 18.x using nvm
    nvm install 18

    # Use Node.js 18
    nvm use 18

    # Clone the repository from GitHub
    git clone https://github.com/VerglasSoftware/educatr-monorepo.git /home/ubuntu/project

    # Export the environment variables from the .env file
    export ARTILLERY_CLOUD_API_KEY="$ARTILLERY_CLOUD_API_KEY"
    export PERF_TEST_PASSWORD="$PERF_TEST_PASSWORD"

    # Install npm dependencies and run tests
    cd /home/ubuntu/project
    npm install
    npx playwright install-deps
    npm run test
EOF

# Terminate EC2 instance and clean up
echo "Terminating EC2 instance..."
aws ec2 terminate-instances --region $AWS_REGION --instance-ids "$INSTANCE_ID" > /dev/null
aws ec2 wait instance-terminated --region $AWS_REGION --instance-ids "$INSTANCE_ID"

# Cleanup security group if it was created by the script
if [ -n "$SECURITY_GROUP" ]; then
    echo "Deleting security group $SECURITY_GROUP..."
    aws ec2 delete-security-group --region $AWS_REGION --group-id "$SECURITY_GROUP" > /dev/null
fi

# Cleanup the subnet if it was created by the script
if [ -n "$SUBNET_ID" ]; then
    echo "Deleting subnet $SUBNET_ID..."
    aws ec2 delete-subnet --region $AWS_REGION --subnet-id "$SUBNET_ID" > /dev/null
fi

# Cleanup the key pair if it was created
if [ -f "$KEY_FILE" ]; then
    echo "Deleting key pair $KEY_NAME..."
    aws ec2 delete-key-pair --region $AWS_REGION --key-name "$KEY_NAME" > /dev/null
    rm -f "$KEY_FILE"
fi

echo "Script completed successfully."