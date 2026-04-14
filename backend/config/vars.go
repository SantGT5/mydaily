package config

import "os"

var (
	DbDriver    = "postgres"
	BackendPort = os.Getenv("BACKEND_PORT")
	PostgresURL = os.Getenv("POSTGRES_URL")
)
