package redis

import (
	"context"
	"fmt"

	"github.com/SantGT5/mydaily/config"
)

var SessionRedisClient = NewRedisClient(config.SessionRedisURL)

type SessionTokenType string

const (
	SessionToken SessionTokenType = "session"
)

func StoreSessionToken(ctx context.Context, expire bool, userID string, ttlSeconds int, tokenType SessionTokenType) (string, error) {
	customKey := userID
	if tokenType != "" {
		customKey = fmt.Sprintf("%s/%s", userID, tokenType)
	}

	// Example Key: session:<token>/<userID>/<tokenType (optional)>
	// Example Value: <userID>
	return Store(ctx, "session", expire, userID, ttlSeconds, customKey, SessionRedisClient)
}

func GetSessionToken(
	ctx context.Context,
	token string,
	returnValue bool,
	tokenType SessionTokenType,
) ([]string, error) {
	return GetByToken(ctx, "session", token, string(tokenType), returnValue, SessionRedisClient)
}

// CleanUserSessionKeys deletes all Redis session keys scoped to the given user ID.
// Empty userID is a no-op (nil error).
func CleanUserSessionKeys(ctx context.Context, userID string) error {
	if userID == "" {
		return nil
	}

	pattern := fmt.Sprintf("session:*/%s", userID)

	keys, err := SessionRedisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return fmt.Errorf("failed while listing session keys from Redis: %w", err)
	}

	if len(keys) == 0 {
		return nil
	}

	if err := SessionRedisClient.Del(ctx, keys...).Err(); err != nil {
		return fmt.Errorf("failed while deleting session keys from Redis: %w", err)
	}

	return nil
}
