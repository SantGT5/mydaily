package mail

import (
	"log"

	"github.com/SantGT5/mydaily-worker/config"
	"github.com/resend/resend-go/v3"
)

func SendEmail(html string, subject string, recipients []string) bool {
	client := resend.NewClient(config.ResendAPIKey)

	if config.IsDebug {
		recipients = []string{"gianspf@gmail.com"}
	}

	params := &resend.SendEmailRequest{
		Html:    html,
		Subject: subject,
		To:      recipients,
		From:    "Acme <onboarding@resend.dev>",
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		log.Printf("failed to send email: %v", err)
		return false
	}

	return true
}
