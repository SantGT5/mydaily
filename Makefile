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
	@echo "* Mailpit: http://localhost:8025 (local only)"
	@echo "*------\n"
.PHONY: urls

#----
# Others
#----

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
