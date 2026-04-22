package mq

import (
	"encoding/json"
	"log"

	"github.com/SantGT5/mydaily-worker/mail"
	amqp "github.com/rabbitmq/amqp091-go"
)

type QueueHandler func(message any)

// QueueHandlers maps queue names to worker handlers.
var QueueHandlers = map[string]QueueHandler{
	"activate-user-account-email":            mail.SendUserWelcomeEmail,
	"successful-activate-user-account-email": mail.SendSuccessfulActivateUserAccountEmail,
}

// callbackFactory creates a RabbitMQ callback for a specific queue.
func callbackFactory(queueName string) func(amqp.Delivery) {
	return func(delivery amqp.Delivery) {
		var message any
		if err := json.Unmarshal(delivery.Body, &message); err != nil {
			log.Printf("invalid JSON in queue %q: %v", queueName, err)
		} else {
			handler := QueueHandlers[queueName]
			if handler != nil {
				handler(message)
			} else {
				log.Printf("no handler for queue: %s", queueName)
			}
		}

		if err := delivery.Ack(false); err != nil {
			log.Printf("failed to ack message from queue %q: %v", queueName, err)
		}
	}
}

// StartWorker starts consuming messages for all registered queues.
func StartWorker() error {
	conn, ch, err := Connect()
	if err != nil {
		return err
	}
	defer ch.Close()
	defer conn.Close()

	if err := ch.Qos(1, 0, false); err != nil {
		return err
	}

	for queueName := range QueueHandlers {
		_, err := ch.QueueDeclare(
			queueName, // name
			true,      // durable
			false,     // auto-delete
			false,     // exclusive
			false,     // no-wait
			nil,       // arguments
		)
		if err != nil {
			return err
		}

		msgs, err := ch.Consume(
			queueName, // queue
			"",        // consumer
			false,     // auto-ack
			false,     // exclusive
			false,     // no-local
			false,     // no-wait
			nil,       // args
		)
		if err != nil {
			return err
		}

		callback := callbackFactory(queueName)
		go func(queue string, deliveries <-chan amqp.Delivery) {
			for delivery := range deliveries {
				callback(delivery)
			}
			log.Printf("delivery channel closed for queue %q", queue)
		}(queueName, msgs)
	}

	log.Printf("MQ Worker started, listening to %d queue(s)", len(QueueHandlers))
	select {}
}
