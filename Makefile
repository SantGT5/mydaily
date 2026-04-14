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
