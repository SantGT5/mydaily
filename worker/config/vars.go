package config

import "os"

var (
	// General
	ENV     = os.Getenv("ENV")
	IsDebug = ENV == "local"
	BaseURL = os.Getenv("BASE_URL")

	// Postgres
	DbDriver    = "postgres"
	PostgresURL = os.Getenv("POSTGRES_URL")

	// Mail
	ResendAPIKey      = os.Getenv("RESEND_API_KEY")
	MailDefaultSender = "MyDaily <onboarding@resend.dev>"

	// RabbitMQ
	RabbitMQURL = os.Getenv("RABBITMQ_URL")
)
