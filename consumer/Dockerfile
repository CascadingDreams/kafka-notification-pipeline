# Stage 1: build
FROM node:24-alpine AS builder
WORKDIR /app

COPY consumer/package*.json ./
RUN npm install

COPY consumer/ .
RUN npm run build

# Stage 2: runtime
FROM node:24-alpine
WORKDIR /app

COPY consumer/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
# consumer will need schemas for Avro decode
COPY schemas/ /schemas/

CMD ["node", "--no-warnings", "dist/index.js"]