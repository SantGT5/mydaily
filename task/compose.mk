#----
# Compose
#----

start/local: urls ## Start local environment
	$(call compose,local,up --build) $(arg)
.PHONY: start/local

#----
# Backend test
#----

test: ## Run unit tests with coverage report
	@docker exec -t backend go test -v -count=1 -cover ./...
.PHONY: test

test/cover: ## Run unit tests with coverage report and race detection
	@docker exec -it backend go test -v -count=1 -race -coverprofile=tmp/coverage.out -covermode=atomic -p=1 ./...
.PHONY: test/cover

test/cover/html: test/cover ## Generate HTML coverage report
	@docker exec -it backend go tool cover -html=tmp/coverage.out -o tmp/coverage.html
.PHONY: test/cover/html
