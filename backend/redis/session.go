package redis

import (
	"context"
	"fmt"

	"github.com/SantGT5/mydaily/config"
)

var SessionRedisClient = NewRedisClient(config.SessionRedisURL)

type SessionTokenType string

const (
	SessionTokenAuth SessionTokenType = "auth"
)

func StoreSessionToken(ctx context.Context, expire bool, userID string, ttlSeconds int, tokenType SessionTokenType) (string, error) {
	customKey := userID
	if tokenType != "" {
		customKey = fmt.Sprintf("%s/%s", userID, tokenType)
	}

	// Example Key: session:<token>/<userID>/<tokenType>
	// Example Value: <userID>
	return Store(ctx, "session", expire, userID, ttlSeconds, customKey, SessionRedisClient)
}

func GetSessionToken(ctx context.Context, token string, returnValue bool, tokenType SessionTokenType) ([]string, error) {
	return GetByToken(ctx, "session", token, string(tokenType), returnValue, SessionRedisClient)
}
