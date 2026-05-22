resource "aws_ecr_repository" "ecr_producer" {
    name = "${var.project_name}/producer"
    image_tag_mutability = "IMMUTABLE"
    force_delete = true

    tags = {
        Name = "producer"
    }
}

resource "aws_ecr_repository" "ecr_consumer" {
    name = "${var.project_name}/consumer"
    image_tag_mutability = "IMMUTABLE"
    force_delete = true

    tags = {
        Name = "consumer"
    }
}