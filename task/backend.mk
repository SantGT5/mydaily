#----
# Test
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

#----
# Quality
#----

backend-check-format: ## Check code formatting
	@gofmt -l ./backend
	@if [ -n "$$(gofmt -l ./backend)" ]; then echo "Code is not formatted. Run 'make format' to format.\n"; exit 1; fi
.PHONY: backend-check-format

backend-format: ## Code formatting
	@gofmt -w ./backend
.PHONY: backend-format
