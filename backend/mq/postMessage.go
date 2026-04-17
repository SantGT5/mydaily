package mq

import (
	"encoding/json"
	"fmt"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Queue string

const (
	QueueActivateUserAccountEmail        Queue = "activate-user-account-email"
	QueueSuccessActivateUserAccountEmail Queue = "successful-activate-user-account-email"
)

func PostMessage(queueName Queue, messageBody any) error {
	if messageBody == nil {
		return fmt.Errorf("message body is required")
	}

	var payload []byte
	switch v := messageBody.(type) {
	case string:
		payload = []byte(v)
		if !json.Valid(payload) {
			return fmt.Errorf("message body string must be valid JSON")
		}
	case []byte:
		payload = v
		if !json.Valid(payload) {
			return fmt.Errorf("message body bytes must be valid JSON")
		}
	default:
		var err error
		payload, err = json.Marshal(v)
		if err != nil {
			return fmt.Errorf("failed to marshal message body to JSON: %w", err)
		}
	}

	conn, ch, err := Connect()
	if err != nil {
		return err
	}

	defer func() {
		err := ch.Close()
		if err != nil {
			log.Printf("failed to close channel: %v", err)
		}
	}()

	defer func() {
		err := conn.Close()
		if err != nil {
			log.Printf("failed to close connection: %v", err)
		}
	}()

	q, err := ch.QueueDeclare(
		string(queueName), // name
		true,              // durable
		false,             // auto-delete
		false,             // exclusive
		false,             // no-wait
		nil,               // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue %q: %w", queueName, err)
	}

	err = ch.Publish(
		"",     // exchange
		q.Name, // routing key (queue name)
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        payload,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to publish message to queue %q: %w", queueName, err)
	}

	return nil
}
