package config

import "os"

var (
	// General
	ENV         = os.Getenv("ENV")
	IsDebug     = ENV == "local"
	BackendPort = os.Getenv("BACKEND_PORT")

	// Postgres
	DbDriver    = "postgres"
	PostgresURL = os.Getenv("POSTGRES_URL")

	// Mail
	ResendAPIKey      = os.Getenv("RESEND_API_KEY")
	MailDefaultSender = os.Getenv("MAIL_DEFAULT_SENDER")

	// RabbitMQ
	RabbitMQURL         = os.Getenv("RABBITMQ_URL")
	RabbitMQDefaultUser = os.Getenv("RABBITMQ_DEFAULT_USER")
	RabbitMQDefaultPass = os.Getenv("RABBITMQ_DEFAULT_PASS")
)
