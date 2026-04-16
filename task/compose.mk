#----
# Compose
#----

start/local: urls ## Start local environment
	$(call compose,local,up --build) $(arg)
.PHONY: start/local
