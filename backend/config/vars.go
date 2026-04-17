package config

import (
	"fmt"
	"os"
)

var REDIS_DB = map[string]int{
	"mail":    1,
	"session": 0,
}

func GetRedisURL(redisURL string, db int) string {
	return fmt.Sprintf("%s/%d", redisURL, db)
}

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
	MailExpiresTime   = 86400 // 24 hours
	MailRedisURL      = GetRedisURL(os.Getenv("REDIS_URL"), REDIS_DB["mail"])

	// RabbitMQ
	RabbitMQURL = os.Getenv("RABBITMQ_URL")
)
