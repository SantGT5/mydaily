#!/bin/sh
set -e

# Apply migrations
migrate -path db/migrations -database "$POSTGRES_URL?sslmode=disable" -verbose up

# Seed default admin if missing (no-op when gianspf@gmail.com already exists)
psql "$POSTGRES_URL?sslmode=disable" -v ON_ERROR_STOP=1 -f /usr/local/share/seed_admin_user.sql

# Generate Swagger documentation (handlers/DTOs live under ./api)
if [ "$ENV" = "local" ]; then
  swag init -g main.go -o ./docs --parseInternal
fi

exec "$@"
