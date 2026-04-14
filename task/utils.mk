ifneq (,$(wildcard .env))
	include .env
	export
	ENV_FILE_PARAM := --env-file .env
endif

help: ## Show command list (default)
	@awk -F ':|##' '/^[^\t].+:.*##/ { printf "\033[36mmake %-28s\033[0m -%s\n", $$1, $$NF }' $(MAKEFILE_LIST) | sort
.PHONY: help

# Check that given variables are set and all have non-empty values.
#
# Params:
#   1. Variable name(s) to test.
#   2. (optional) Error message to print.
# 
# Usage:
# $(call check_defined, MY_FLAG)
# $(call check_defined, MY_FLAG1 MY_FLAG2)
# 
# $(call check_defined, \
#             MY_FLAG1 \
#             MY_FLAG2, \
#         CUSTOM_ERROR_MESSAGE)
define check_defined
$(foreach var,$1, \
    $(if $(value $(var)),, \
        $(error Undefined variable `$(var)`$(if $2, ($(strip $(value 2)))))))
endef

# validate_enum: Check if a value is in a list of valid options.
# Params:
#   1. Value to check.
#   2. Space-separated list of valid values.
#   3. Variable name (for error message).
# 
# Usage:
# 	pause_timeout ?= 120
#   VALID_TIMEOUTS := 120 180 240 300
# 
#   $(call validate_enum,$(pause_timeout),$(VALID_TIMEOUTS),"pause_timeout")
define validate_enum
	@if ! echo "$(2)" | grep -qw "$(1)"; then \
		echo "❌ Error: Invalid value for $(3): '$(1)'. Must be one of: $(2)"; \
		exit 1; \
	fi
endef

# Usage examples:
#   Run the local environment with build:
#     $(call compose,local,up --build)
#
#   Run a command inside the local backend container (e.g., DB migration):
#     $(call compose,local,exec -t backend flask db upgrade)
#
# This macro runs docker compose with the base file and an environment-specific override.
# Arguments:
#   1 - environment (e.g., local, dev, prod)
#   2 - docker compose command (e.g., up --build, exec -t backend ...)
define compose
	docker compose -f docker/compose.yaml -f docker/compose.$(1).yaml \
		--project-name $(PROJECT_NAME) $(2)
endef
