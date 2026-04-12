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
	curl -s -X POST http://localhost:3001/events \
	  -H 'Content-Type: application/json' \
	  -d '{"event_type": "user.registered", "user_id": "00000000-0000-0000-0000-000000000001"}'
	curl -s -X POST http://localhost:3001/events \
	  -H 'Content-Type: application/json' \
	  -d '{"event_type": "transaction.threshold_exceeded", "user_id": "00000000-0000-0000-0000-000000000001", "amount": 9500.00, "currency": "AUD"}'
	@echo "Seeded. Check Kafka UI: http://localhost:8080"

# Runs vitest
test:
	cd producer && npm ci && npm test -- --run
	cd consumer && npm ci && npm test -- --run
	cd dashboard && npm ci && npm test -- --run

# Running just make with no targer = docker compose up -d