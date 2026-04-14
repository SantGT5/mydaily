#!/bin/sh
set -e

# Apply migrations
migrate -path db/migrations -database "$POSTGRES_URL?sslmode=disable" -verbose up

# Generate Swagger documentation (handlers/DTOs live under ./api)
if [ "$ENV" = "local" ]; then
  swag init -g main.go -o ./docs --parseInternal
fi

exec "$@"
