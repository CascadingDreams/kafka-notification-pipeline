resource "aws_key_pair" "ec2_key" {
  key_name = "${var.project_name}-kafka-key"
  public_key = file("~/.ssh/kafka-ec2.pub")
}

resource "aws_instance" "kafka" {
  ami           = "ami-0310483fb2b488153"
  instance_type = var.kafka_instance
  vpc_security_group_ids = [aws_security_group.allow_ec2.id]
  key_name = aws_key_pair.ec2_key.key_name

  tags = {
    Name = "${var.project_name}-kafka"
  }
}
