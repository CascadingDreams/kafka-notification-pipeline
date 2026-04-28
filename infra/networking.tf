data "aws_vpc" "default" {
  default = true
}

# KAFKA EC2 SECURITY GROUP
resource "aws_security_group" "allow_ec2" {
  name = "kafka_ec2_security_group"
  description = "Security group for kafka, SSH and Schema Registry"
  vpc_id = data.aws_vpc.default.id

  tags = {
    Name = "${var.project_name}-ec2"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_kafka" {
  security_group_id = aws_security_group.allow_ec2.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 9092
  ip_protocol       = "tcp"
  to_port           = 9092
}

resource "aws_vpc_security_group_ingress_rule" "allow_ssh" {
  security_group_id = aws_security_group.allow_ec2.id
  cidr_ipv4         = "${var.my_ip}/32"
  from_port         = 22
  ip_protocol       = "tcp"
  to_port           = 22
}

resource "aws_vpc_security_group_ingress_rule" "allow_schema_registry" {
  security_group_id = aws_security_group.allow_ec2.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 8081
  ip_protocol       = "tcp"
  to_port           = 8081
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.allow_ec2.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

# ECS SECURITY GROUP
resource "aws_security_group" "allow_ecs" {
  name        = "${var.project_name}-ecs"
  description = "Security group for ECS Fargate tasks"
  vpc_id      = data.aws_vpc.default.id

  tags = {
    Name = "${var.project_name}-ecs"
  }
}


# RDS SECURITY GROUP
resource "aws_security_group" "allow_rds" {
  name        = "${var.project_name}-rds"
  description = "Security group for RDS"
  vpc_id      = data.aws_vpc.default.id

  tags = {
    Name = "${var.project_name}-rds"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_rds" {
  security_group_id = aws_security_group.allow_rds.id
  referenced_security_group_id = aws_security_group.allow_ecs.id
  from_port         = 5432
  ip_protocol       = "tcp"
  to_port           = 5432
}
