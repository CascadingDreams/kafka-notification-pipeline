data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "allow_ec2" {
  name = "kafka_ec2_security_group"
  description = "Security group for kafka, SSH and Schema Registry"
  vpc_id = data.aws_vpc.default.id

  tags = {
    Name = "kafka_ec2_security_group"
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

resource "aws_instance" "kafka" {
  ami           = "ami-0310483fb2b488153"
  instance_type = var.kafka_instance
  vpc_security_group_ids = [aws_security_group.allow_ec2.id]

  tags = {
    Name = "${var.project_name}-kafka"
  }
}