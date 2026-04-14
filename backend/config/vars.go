package config

import "os"

var (
	DbDriver    = "postgres"
	ENV         = os.Getenv("ENV")
	IsDebug     = ENV == "local"
	BackendPort = os.Getenv("BACKEND_PORT")
	PostgresURL = os.Getenv("POSTGRES_URL")
)
