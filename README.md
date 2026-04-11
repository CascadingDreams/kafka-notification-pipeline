# ⚡ kafka-notification-pipeline

> 🚧 **Work in progress** — infrastructure built, services coming next.

Inspired by real-world financial services infrastructure, where event-driven pipelines process transactions, trigger notifications, and feed audit systems at scale. A Flask producer API emits Avro-encoded events to Apache Kafka topics, a Python consumer processes and persists them to PostgreSQL, and a React dashboard visualises live event throughput as it flows through the pipeline.

---

## Architecture

```
Rough diagram only
```
![kafka-notification-diagram](docs/imgs/kafka-notification-diagram-dark.png)
---

## Tech stack including future implementations

| Layer | Technology | Notes |
|---|---|---|
| Message broker | Apache Kafka 3.9 (KRaft) | No Zookeeper — `apache/kafka:3.9.0` |
| Schema format | Avro + Schema Registry | Enforces message contracts |
| Kafka UI | Kafbat UI | Monitor topics at `localhost:8080` |
| Producer | Python 3.12 + Flask | REST API, emits Avro-encoded events |
| Consumer | Python 3.12 + confluent-kafka | Poll loop, manual offset commit |
| Database | PostgreSQL 16 | Persists events, idempotent inserts |
| Frontend | React 18 + Vite + recharts | Live pipeline visualiser |
| Logging | structlog | Structured JSON — OpenSearch-ready |
| Testing | pytest + pact-python | Unit, integration, contract tests |
| Infra | Docker Compose | Full stack with one command |
| CI | GitHub Actions | Lint + tests on push/PR |

---

## Build status

- [x] Docker Compose stack — Kafka (KRaft), Kafbat UI, PostgreSQL
- [x] PostgreSQL schema — `events` table with idempotent insert pattern
- [x] Makefile — `make up`, `make down`, `make logs`, `make db`, `make seed`, `make test`
- [ ] Producer service — Flask API + Avro serialisation + AdminClient topic creation
- [ ] Avro schemas + Schema Registry
- [ ] Consumer service — poll loop, manual offset commit, DLQ, idempotent consumer
- [ ] React dashboard — live pipeline visualiser + event log
- [ ] GitHub Actions CI
- [ ] Contract tests with pact-python

---

## Services:

| Service | URL |
|---|---|
| Kafbat UI | http://localhost:8080 |
| Producer API | http://localhost:5001 *(not yet built)* |
| Dashboard | http://localhost:3000 *(not yet built)* |
| PostgreSQL | `localhost:5432` |

---

## Makefile commands

| Command | What it does |
|---|---|
| `make up` | Start all services detached |
| `make down` | Stop and remove containers |
| `make logs` | Stream logs from all services |
| `make ps` | Show container status |
| `make db` | Open psql in the postgres container |
| `make seed` | Fire test events at the producer API |
| `make test` | Run pytest in the producer container |

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