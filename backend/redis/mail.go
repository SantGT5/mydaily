package redis

import (
	"context"
	"errors"
	"fmt"

	"github.com/SantGT5/mydaily/config"
)

var RedisClient = NewRedisClient(config.MailRedisURL)

type MailTokenType string

const (
	MailTokenConfirmEmail     MailTokenType = "confirm_email"
	MailTokenResetCredentials MailTokenType = "reset_credentials"
)

func StoreMailToken(
	ctx context.Context,
	expire bool,
	userID string,
	ttlSeconds int,
	tokenType MailTokenType,
) (string, error) {
	if tokenType == "" {
		return "", errors.New("token type is required")
	}

	customKey := fmt.Sprintf("%s/%s", userID, tokenType)

	// Example Key: mail:1234567890:confirm_email
	// Example Value: 1234567890
	return Store(ctx, "mail", expire, userID, ttlSeconds, customKey, RedisClient)
}
