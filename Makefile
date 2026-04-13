-include .env
export

# command names
.PHONY: up down logs ps db seed test setup install

# First-time setup: copy env.example → .env
setup:
	@test -f .env && echo ".env already exists, skipping" || (cp env.example .env && echo "Created .env from env.example — fill in POSTGRES_USER and POSTGRES_PASSWORD before running make up")

up:
	docker compose up -d

down:
	docker compose down

rebuild:
	docker compose up -d --build

logs:
	docker compose logs -f

# status
ps:
	docker compose ps

install:
	npm install --prefix producer
	npm install --prefix consumer

# postgres interactive shell
db:
	docker compose exec postgres psql -U $${POSTGRES_USER} -d kafka-notifications

# Will target fire a test event at producer API - WIP
seed:
	curl -s -X POST http://localhost:3001/events/user \
	  -H 'Content-Type: application/json' \
	  -d '{"event_type": "user.registered", "user_id": "550e8400-e29b-41d4-a716-446655440000"}'
	curl -s -X POST http://localhost:3001/events/transactions \
	  -H 'Content-Type: application/json' \
	  -d '{"event_type": "transaction.threshold_exceeded", "user_id": "550e8400-e29b-41d4-a716-446655440000", "amount": 9500.00, "currency": "AUD"}'
	@echo "Seeded. Check Kafka UI: http://localhost:8080"

# Runs vitest
test:
	cd producer && npm ci && npm test -- --run
	cd consumer && npm ci && npm test -- --run

# Running just make with no targer = docker compose up -d