resource "aws_instance" "kafka" {
  ami           = "ami-0310483fb2b488153"
  instance_type = var.kafka_instance

  tags = {
    Name = "${var.project_name}-kafka"
  }
}