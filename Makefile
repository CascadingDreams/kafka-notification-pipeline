include .env
export

# command names
.PHONY: up down logs ps db seed test

up:
	docker compose up -d

down:
	docker compose down

rebuild: down up

logs:
	docker compose logs -f

# status
ps:
	docker compose ps

# postgres interactive shell
db:
	docker compose exec postgres psql -U $${POSTGRES_USER} -d kafka-notifications

# Will target fire a test event at producer API - WIP
seed:
	curl -X POST http://localhost:3001/events \
	-H 'Content-Type: application/json' \
	-d '{"event_type": "user.registered", "user_id": "00000000-0000-0000-0000-000000000001"}'

# Runs vitest
test:
	docker compose exec producer npx vitest run

# Running just make with no targer = docker compose up -d