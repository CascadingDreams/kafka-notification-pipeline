variable "aws_region" {
    type = string
    description = "AWS region"
    default = "ap-southeast-2"
}

variable "project_name" {
    type = string
    description = "Project name"
    default = "kafka-notification-pipeline"
}

variable "kafka_instance" {
    type = string
    description = "EC2 instance type for Kafka"
    default = "t3.micro"
}

variable "db_instance" {
    type = string
    description = "database instance type RDS"
    default = "db.t3.micro"
}