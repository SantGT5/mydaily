package mq

import (
	"fmt"

	"github.com/SantGT5/mydaily-worker/config"
	amqp "github.com/rabbitmq/amqp091-go"
)

// Connect creates and verifies a RabbitMQ connection and channel.
func Connect() (*amqp.Connection, *amqp.Channel, error) {
	if config.RabbitMQURL == "" {
		return nil, nil, fmt.Errorf("RABBITMQ_URL is not set")
	}

	conn, err := amqp.Dial(config.RabbitMQURL)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		_ = conn.Close()
		return nil, nil, fmt.Errorf("failed to open RabbitMQ channel: %w", err)
	}

	return conn, ch, nil
}
