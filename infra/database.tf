data "aws_subnets" "default" {
    filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
    }
}

resource "aws_db_subnet_group" "main" {
    name = "${var.project_name}-db-subnet-group"
    subnet_ids = data.aws_subnets.default.ids

    tags = {
        Name = "postgresdb"
    }
}

resource "aws_db_instance" "main" {
  allocated_storage    = 10
  db_name              = var.db_name
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = "db.t3.micro"
  username             = var.db_username
  password             = var.db_password
  skip_final_snapshot  = true
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.allow_rds.id]
}