#----
# SQLC
#----

sqlc: ## Generate SQLC code from SQL files
	@docker exec -it backend sqlc generate
.PHONY: sqlc

#----
# Migration
#----

define DB_MIGRATE
    @docker exec -it backend /bin/sh -c 'migrate -path db/migrations -database "$$POSTGRES_URL?sslmode=disable" -verbose $(1)'
endef

migrate-new: ## Create a new migration (make migrate-new name=version_name)
	$(call check_defined, name, migration name)

	@docker exec -it backend /bin/sh -c 'migrate create -ext sql -dir db/migrations -seq $(name)'
.PHONY: migrate-new

migrate-up: ## Apply database migrations (up)
	$(call DB_MIGRATE, up)
.PHONY: migrate-up

migrate-down: ## Revert database migrations (down)
	$(call DB_MIGRATE, down)
.PHONY: migrate-down

migrate-reapply: migrate-down migrate-up ## Revert and then re-apply all database migrations
.PHONY: migrate-reapply
