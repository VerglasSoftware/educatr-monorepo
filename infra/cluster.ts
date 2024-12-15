// const vpc = new sst.aws.Vpc("Vpc");
// export const cluster = new sst.aws.Cluster("ExecutionCluster", { vpc });

// const pistonService = cluster.addService("PistonService", {
//     image: "ghcr.io/engineer-man/piston:latest",
//     scaling: {
//       min: 1,
//       max: 1,
//       cpuUtilization: 50,
//       memoryUtilization: 50,
//     },
//     serviceRegistry: {
//       port: 2000
//     },
//     cpu: "0.25 vCPU",
//     memory: "0.5 GB",
//     logging: { retention: "1 day" },
//     dev: false,
//     architecture: "x86_64"
// });

// const pistonApi = new sst.aws.ApiGatewayV2("PistonApi", {
//   vpc,
//   domain: $app.stage === "prod" ? "exec.educatr.uk" : undefined,
//   transform: {
// 		route: {
// 			args: {
// 				auth: { iam: $app.stage === "prod" },
// 			},
// 		},
// 	},
// });
// pistonApi.routePrivate("$default", pistonService.nodes.cloudmapService.arn);

const securityGroup = new aws.ec2.SecurityGroup("web-secgrp", {
	ingress: [
		{
			protocol: "tcp",
			fromPort: 2358,
			toPort: 2358,
			cidrBlocks: ["0.0.0.0/0"],
		},
	],
	egress: [
		{
			protocol: "-1",
			fromPort: 0,
			toPort: 0,
			cidrBlocks: ["0.0.0.0/0"],
		},
	],
});

const ami = aws.ec2.getAmi({
	filters: [
		{
			name: "name",
			values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"],
		},
	],
	mostRecent: true,
	owners: ["099720109477"], // Canonical
});

const userData = `#!/bin/bash

# Function to check if the internet is reachable
check_internet() {
    echo "Checking for internet access..."
    
    # Wait until the EC2 instance can ping Google's DNS server
    until ping -c 1 8.8.8.8 &>/dev/null; do
        echo "No internet access, retrying..."
        sleep 5
    done
    
    echo "Internet is now available!"
}

# Wait for the internet access to be available
check_internet

# Now that we have internet access, continue with the rest of the script

# Ensure the system is up-to-date and Docker & Docker Compose are installed
echo "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

sudo mkdir /opt/judge0
cd /opt/judge0

# Install Docker and Docker Compose if not already installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    sudo apt-get install -y docker.io
else
    echo "Docker is already installed."
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found. Installing Docker Compose..."
    # sudo apt-get install -y docker-compose
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    docker-compose --version
else
    echo "Docker Compose is already installed."
fi

sudo apt-get install unzip -y
sudo apt-get install jq -y

# Download and extract Judge0 release
echo "Downloading and extracting Judge0 v1.13.1..."
wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip
unzip judge0-v1.13.1.zip

# Generate random passwords for Redis and PostgreSQL
REDIS_PASSWORD=$(curl -s https://randomuser.me/api/ | jq -r '.results[0].login.password')
POSTGRES_PASSWORD=$(curl -s https://randomuser.me/api/ | jq -r '.results[0].login.password')

# Update judge0.conf file with generated passwords
echo "Updating judge0.conf with Redis and PostgreSQL passwords..."
sudo sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=\${REDIS_PASSWORD}/" judge0-v1.13.1/judge0.conf
sudo sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}/" judge0-v1.13.1/judge0.conf

# Navigate to the Judge0 directory
cd judge0-v1.13.1

# Run the Docker containers for the db and redis services
echo "Starting Redis and PostgreSQL services..."
docker-compose up -d db redis

# Wait a few seconds for initialization
echo "Waiting for services to initialize..."
sleep 10s

# Start all services
echo "Starting all services..."
docker-compose up -d

# Wait for services to be fully initialized
echo "Waiting for all services to initialize..."
sleep 5s

echo "Deployment completed successfully!!"`;

export const server = new aws.ec2.Instance("ExecuteServer", {
	instanceType: "t2.micro",
	ami: ami.then((ami) => ami.id),
	userData: userData,
	vpcSecurityGroupIds: [securityGroup.id],
	associatePublicIpAddress: true,
	userDataReplaceOnChange: true,
	rootBlockDevice: {
		volumeSize: 50,
		volumeType: "gp2",
	},
});

export const executeApi = new sst.aws.ApiGatewayV2("ExecuteApi", {
	domain: $app.stage === "prod" ? "exec.educatr.uk" : undefined,
	transform: {
		route: {
			args: {
				auth: { iam: $app.stage === "prod" },
			},
		},
	},
});

server.publicIp.apply((ip) => {
	executeApi.routeUrl("$default", `http://${ip}:2358`);
});
