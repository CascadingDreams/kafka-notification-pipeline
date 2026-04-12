# ⚡ kafka-notification-pipeline

 > 🚧 **Work in progress** — producer API, Avro schemas, and Schema Registry live; consumer and dashboard coming next. 

Inspired by real-world financial services infrastructure, where event-driven pipelines process transactions, trigger notifications, and feed audit systems at scale. A Hono producer API validates requests with Zod and serialises events as Avro to Apache Kafka via Confluent Schema Registry, a TypeScript consumer processes and persists them to PostgreSQL, and a React dashboard visualises live event throughput as it flows through the pipeline.

---


## Tech stack including future implementations

| Layer | Technology | Notes |
|---|---|---|
| Message broker | Apache Kafka 3.9 (KRaft) | No Zookeeper — `apache/kafka:3.9.0` |
| Schema format | Avro + Confluent Schema Registry | Enforces message contracts |
| Kafka UI | Kafbat UI | Monitor topics at `localhost:8080` |
| Producer | TypeScript + Hono | REST API, Zod validation, emits Avro-encoded events |
| Consumer | TypeScript + kafkajs | Poll loop, manual offset commit, DLQ |
| Database | PostgreSQL 16 | Persists events, idempotent inserts |
| Frontend | React 18 + Vite | Live pipeline visualiser |
| Testing | vitest | Unit + integration tests |
| Infra | Docker Compose | Full stack with one command |
| CI | GitHub Actions | Lint + tests on push/PR |

---

## Architecture

![Architecture diagram](docs/imgs/Kafka-notification-pipeline-diagram.png)

## Schema Registry flow

- On startup, the producer registers its Avro schemas with Schema Registry and caches the returned schema IDs
- When an HTTP request arrives, Zod validates the payload at the API boundary before anything touches Kafka
- For each valid event, the producer encodes the payload as Avro bytes with the schema ID embedded, and produces it to the correct Kafka topic
- The consumer receives raw Avro bytes and reads the embedded schema ID from each message
- It fetches the matching Avro schema from Schema Registry using that ID
- decode() converts the Avro bytes into a plain JavaScript object ready for processing
- Because the schema ID travels with every message, producer and consumer never share schema files directly — Schema Registry is the single source of truth

![Architecture diagram](docs/imgs/schema-registry-sequence.png)


## Build status

- [x] Docker Compose stack — Kafka (KRaft), Kafbat UI, PostgreSQL, Schema Registry, Producer
- [x] PostgreSQL schema — `events` table with idempotent insert pattern
- [x] Makefile — `make up`, `make down`, `make logs`, `make db`, `make seed`, `make test`
- [x] Producer service — Hono API + Zod validation + Avro serialisation + Schema Registry registration
- [x] Avro schemas + Confluent Schema Registry — `user-event` and `transaction-event` schemas registered on startup
- [x] `make seed` + Postman — both endpoints verified end-to-end (see [API reference](#api-reference))
- [ ] Consumer service — kafkajs poll loop, manual offset commit, DLQ, idempotent consumer
- [ ] React dashboard — live pipeline visualiser + event log
- [ ] GitHub Actions CI

---

## Services

| Service | URL |
|---|---|
| Kafbat UI | http://localhost:8080 |
| Schema Registry | http://localhost:8081 |
| Producer API | http://localhost:3001 |
| Dashboard | http://localhost:3000 *(not yet built)* |
| PostgreSQL | `localhost:5432` |

---

## Makefile commands

| Command | What it does |
|---|---|
| `make up` | Start all services detached |
| `make down` | Stop and remove containers |
| `make rebuild` | Rebuild images and start services |
| `make logs` | Stream logs from all services |
| `make ps` | Show container status |
| `make db` | Open psql in the postgres container |
| `make seed` | POST one `user.registered` and one `transaction.threshold_exceeded` event to the producer API |
| `make test` | Run vitest across producer, consumer, and dashboard |

---

## API reference

Base URL (local): `http://localhost:3001`

**Request flow**
```
start() → Kafka connects → Avro schemas registered → HTTP server on :3001
POST /events/* → zValidator → build event → produceEvent (Avro encode → Kafka) → 202
```

All endpoints accept and return JSON. Events are Zod-validated at the HTTP boundary and Avro-encoded before being produced to Kafka.

---

### `GET /health`

Returns the service health status.

**Response `200`**
```json
{ "status": "ok" }
```

---

### `POST /events/user`

Publishes a user event to the `user.events` Kafka topic.

**Request body**
```json
{
  "event_type": "user.registered",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {}
}
```

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `event_type` | string | yes | `user.registered`, `user.login`, `user.password_reset` |
| `user_id` | string (UUID v4) | yes | — |
| `metadata` | object | no | `Record<string, string>` |

**Response `202`**
```json
{
  "status": "accepted",
  "event_id": "a1b2c3d4-..."
}
```

**Example — `make seed`**
```bash
curl -s -X POST http://localhost:3001/events/user \
  -H 'Content-Type: application/json' \
  -d '{"event_type": "user.registered", "user_id": "550e8400-e29b-41d4-a716-446655440000"}'
```

---

### `POST /events/transactions`

Publishes a transaction event to the `transaction.events` Kafka topic.

**Request body**
```json
{
  "event_type": "transaction.threshold_exceeded",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 9500.00,
  "currency": "AUD",
  "metadata": {}
}
```

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `event_type` | string | yes | `transaction.completed`, `transaction.failed`, `transaction.threshold_exceeded` |
| `user_id` | string (UUID v4) | yes | — |
| `amount` | number (positive) | yes | — |
| `currency` | string | yes | `AUD` |
| `metadata` | object | no | `Record<string, string>` |

**Response `202`**
```json
{
  "status": "accepted",
  "event_id": "a1b2c3d4-..."
}
```

**Example — `make seed`**
```bash
curl -s -X POST http://localhost:3001/events/transactions \
  -H 'Content-Type: application/json' \
  -d '{"event_type": "transaction.threshold_exceeded", "user_id": "550e8400-e29b-41d4-a716-446655440000", "amount": 9500.00, "currency": "AUD"}'
```

---

### Testing with Postman

Import the following request collection manually or use the curl examples above.

1. Start the stack: `make up`
2. Wait for the producer healthcheck to pass (`make ps`)
3. Send requests to `http://localhost:3001` — both endpoints below were verified end-to-end against a running stack

**Verified requests**

| # | Method | Endpoint | Body |
|---|---|---|---|
| 1 | `GET` | `/health` | — |
| 2 | `POST` | `/events/user` | `{"event_type": "user.registered", "user_id": "550e8400-e29b-41d4-a716-446655440000"}` |
| 3 | `POST` | `/events/user` | `{"event_type": "user.login", "user_id": "550e8400-e29b-41d4-a716-446655440000"}` |
| 4 | `POST` | `/events/transactions` | `{"event_type": "transaction.threshold_exceeded", "user_id": "550e8400-e29b-41d4-a716-446655440000", "amount": 9500.00, "currency": "AUD"}` |
| 5 | `POST` | `/events/transactions` | `{"event_type": "transaction.completed", "user_id": "550e8400-e29b-41d4-a716-446655440000", "amount": 250.00, "currency": "AUD"}` |

After each POST, confirm in Kafbat UI (`http://localhost:8080`) that the message landed in the correct topic with an Avro-encoded payload.

---

## Event schema plan

All events are Avro-encoded. JSON representation:

**user.events**
```json
{
  "event_id": "uuid4",
  "event_type": "user.registered | user.login | user.password_reset",
  "user_id": "uuid4",
  "timestamp": "ISO8601",
  "metadata": {}
}
```

**transaction.events**
```json
{
  "event_id": "uuid4",
  "event_type": "transaction.completed | transaction.failed | transaction.threshold_exceeded",
  "user_id": "uuid4",
  "amount": 0.00,
  "currency": "AUD",
  "timestamp": "ISO8601",
  "metadata": {}
}
```

---

## Key Kafka concepts to be implemented

| Concept | Implementation | Why it matters |
|---|---|---|
| Topics | `user.events`, `transaction.events`, `dlq` | Logical channels per event type |
| Partitions | 3 per topic | Parallelism — multiple consumers |
| Consumer groups | `notification-group` | Horizontal scaling |
| Manual offset commit | `enable.auto.commit: false` | At-least-once delivery guarantee |
| Dead Letter Queue | `dlq` topic | Failed messages aren't lost |
| Message keys | `user_id` | Ordering guaranteed per user |
| Idempotent consumer | `ON CONFLICT DO NOTHING` on `event_id` | Safe on duplicate delivery |

---

## Environment variables

Copy `env.example` to `.env`:
POSTGRES_USER=
POSTGRES_PASSWORD=

Never commit `.env` — it is gitignored.

---

## Why Kafka?

At scale in financial services, one event stream fans out to multiple independent consumers simultaneously — fraud detection, push notifications, audit logging, data warehouse — all reading the same Kafka topic without knowing about each other. This project demonstrates that pattern at a smaller scale: a single producer, a single consumer, but with the architectural vocabulary (topics, partitions, consumer groups, offsets, DLQ) that transfers directly to production systems.

---

*[samanthahill.dev](https://samanthahill.dev) · [LinkedIn](https://www.linkedin.com/in/sammy-hill-173078142/)*