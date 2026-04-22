package redis

import (
	"context"
	"errors"
	"fmt"

	"github.com/SantGT5/mydaily/config"
)

var MailRedisClient = NewRedisClient(config.MailRedisURL)

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

	// Example Key: mail:<token>/<userID>/<tokenType>
	// Example Value: <userID>
	return Store(ctx, "mail", expire, userID, ttlSeconds, customKey, MailRedisClient)
}

func GetMailToken(
	ctx context.Context,
	token string,
	returnValue bool,
	tokenType MailTokenType,
) ([]string, error) {
	return GetByToken(ctx, "mail", token, string(tokenType), returnValue, MailRedisClient)
}

// CleanUserMailKeys deletes all Redis mail keys scoped to the given user ID.
// Empty userID is a no-op (nil error).
func CleanUserMailKeys(ctx context.Context, userID string) error {
	if userID == "" {
		return nil
	}

	pattern := fmt.Sprintf("mail:*/%s/*", userID)

	keys, err := MailRedisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return fmt.Errorf("failed while listing mail keys from Redis: %w", err)
	}

	if len(keys) == 0 {
		return nil
	}

	if err := MailRedisClient.Del(ctx, keys...).Err(); err != nil {
		return fmt.Errorf("failed while deleting mail keys from Redis: %w", err)
	}

	return nil
}
