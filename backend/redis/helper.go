package redis

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

// NewRedisClient creates a new Redis client.
// It returns the Redis client on success, or nil on failure.
func NewRedisClient(url string) *redis.Client {
	opts, err := redis.ParseURL(url)

	if err != nil {
		log.Printf("Failed to parse Redis URL: %v", err)

		return nil
	}

	return redis.NewClient(opts)
}

// Store saves a value in Redis under a generated token.
// It returns the token on success, or an empty string on failure.
func Store(
	ctx context.Context,
	db string,
	expire bool,
	value string,
	ttlSeconds int,
	customKey string,
	client *redis.Client,
) (string, error) {
	keyBytes := make([]byte, 32)

	if _, err := rand.Read(keyBytes); err != nil {
		return "", fmt.Errorf("failed to generate random key: %v", err)
	}

	key := hex.EncodeToString(keyBytes)
	redisKey := fmt.Sprintf("%s:%s", db, key)

	if customKey != "" {
		redisKey = fmt.Sprintf("%s/%s", redisKey, customKey)
	}

	var err error

	if expire {
		err = client.Set(ctx, redisKey, value, time.Duration(ttlSeconds)*time.Second).Err()
	} else {
		err = client.Set(ctx, redisKey, value, 0).Err()
	}

	if err != nil {
		return "", fmt.Errorf("failed to store value in Redis: %v", err)
	}

	return key, nil
}

// GetByToken gets a value from Redis by token.
// It returns the value on success, or an error on failure.
func GetByToken(
	ctx context.Context,
	db string,
	token string,
	tokenType string,
	returnValue bool,
	client *redis.Client,
) ([]string, error) {
	keyPattern := fmt.Sprintf("%s:%s/*", db, token)

	if tokenType != "" {
		keyPattern = fmt.Sprintf("%s:%s/*/%s", db, token, tokenType)
	}

	keys, err := client.Keys(ctx, keyPattern).Result()
	if err != nil {
		return nil, fmt.Errorf("failed while getting keys from Redis: %v", err)
	}

	if !returnValue {
		return keys, nil
	}

	values := make([]string, 0, len(keys))

	for _, key := range keys {
		value, getErr := client.Get(ctx, key).Result()
		if getErr != nil {
			return nil, fmt.Errorf("failed while getting value from Redis: %v", getErr)
		}

		values = append(values, value)
	}

	return values, nil
}

// CleanUserMailKeys deletes all Redis mail keys scoped to the given user ID.
// Empty userID is a no-op (nil error).
func CleanUserMailKeys(ctx context.Context, userID string, client *redis.Client) error {
	if userID == "" {
		return nil
	}

	pattern := fmt.Sprintf("mail:*/%s/*", userID)

	keys, err := client.Keys(ctx, pattern).Result()
	if err != nil {
		return fmt.Errorf("failed while listing mail keys from Redis: %w", err)
	}

	if len(keys) == 0 {
		return nil
	}

	if err := client.Del(ctx, keys...).Err(); err != nil {
		return fmt.Errorf("failed while deleting mail keys from Redis: %w", err)
	}

	return nil
}
