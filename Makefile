#----
# Imports
#----

include $(wildcard task/*.mk)

#----
# Variables
#----

.DEFAULT_GOAL := help

PROJECT_NAME := mydaily

#----
# Info
#----

urls: ## Show the urls to the running applications
	@echo "*------"
	@echo "* My Daily"
	@echo "*"
	@echo "* Backend: https://mydaily.com/api/"
	@echo "*"
	@echo "* Swagger: https://mydaily.com/api/swagger (local only)"
	@echo "*------\n"
.PHONY: urls

#----
# Others
#----

go-check-quality: ## Check code formatting
	@gofmt -l ./backend
	@if [ -n "$$(gofmt -l ./backend)" ]; then echo "Code is not formatted. Run 'make format' to format.\n"; exit 1; fi
.PHONY: go-check-quality

format: ## Code formatting
	@gofmt -w ./backend
.PHONY: format

install: install/ci ## Install pre commit & npm dependencies & create .env file
	@echo "\nInstalling pre-commit"
	@pipx install pre-commit

	@echo "\nInstalling pre-commit hook"
	@pre-commit install --hook-type pre-commit --hook-type commit-msg

install/ci: ## Install dependencies and create .env file
	@if [ ! -e .env ]; then \
		cp .env.example .env && echo "\nFile .env created"; \
	else \
		echo "\nFile .env already exists"; \
	fi

quality: ## Runs pre-commit tasks
	@pre-commit run --all-files
