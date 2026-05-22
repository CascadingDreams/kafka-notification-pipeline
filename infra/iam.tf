resource "aws_iam_role" "ecs_task_execution" {
    name = "${var.project_name}-ecs-task-execution"
    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [{
            Effect    = "Allow"
            Principal = { Service = "ecs-tasks.amazonaws.com" }
            Action    = "sts:AssumeRole"
        }]
    })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
    role = aws_iam_role.ecs_task_execution.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# OIDC setup
resource "aws_iam_openid_connect_provider" "github" {
    url = "https://token.actions.githubusercontent.com"
    client_id_list = ["sts.amazonaws.com"]
    thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"] # rec placehodler
}

resource "aws_iam_role" "github_actions" {
    name = "${var.project_name}-github-actions"
    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [{
            Effect    = "Allow"
            Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
            Action    = "sts:AssumeRoleWithWebIdentity"
            Condition = {
            StringLike = {
                "token.actions.githubusercontent.com:sub" = "repo:CascadingDreams/kafka-notification-pipeline:*"
                }
            }
        }]
    })
}