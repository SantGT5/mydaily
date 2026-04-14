package config

import "os"

var (
	BackendPort = os.Getenv("BACKEND_PORT")
	PostgresURL = os.Getenv("POSTGRES_URL")
)
