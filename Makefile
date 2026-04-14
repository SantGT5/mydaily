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

quality: ## Check code formatting
	@gofmt -l ./backend
	@if [ -n "$$(gofmt -l ./backend)" ]; then echo "Code is not formatted. Run 'make format' to format.\n"; exit 1; fi
.PHONY: quality

format: ## Code formatting
	@gofmt -w ./backend
.PHONY: format
