package redis

import (
	"context"
	"errors"
	"fmt"

	"github.com/SantGT5/mydaily/config"
)

type ServiceTokenType string

const (
	ServiceTokenGithub ServiceTokenType = "github"
)

var ServiceRedisClient = NewRedisClient(config.ServiceRedisURL)

func StoreServiceToken(
	ctx context.Context,
	userID string,
	service ServiceTokenType,
) (string, error) {

	// Example Key: service:<token>/<service>
	return Store(ctx, "service", true, userID, 3600, string(service), ServiceRedisClient)
}

func GetServiceToken(
	ctx context.Context,
	token string,
	returnValue bool,
	service ServiceTokenType,
) (string, error) {
	values, err := GetByToken(ctx, "service", token, "", returnValue, ServiceRedisClient)
	if err != nil {
		return "", err
	}

	if len(values) == 0 {
		return "", errors.New("token not found")
	}

	return values[0], nil
}

func CleanUserServiceKeys(ctx context.Context, token string, service ServiceTokenType) error {
	if token == "" {
		return nil
	}

	pattern := fmt.Sprintf("service:%s/%s", token, string(service))

	keys, err := ServiceRedisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return fmt.Errorf("failed while listing service keys from Redis: %w", err)
	}

	if len(keys) == 0 {
		return nil
	}

	if err := ServiceRedisClient.Del(ctx, keys...).Err(); err != nil {
		return fmt.Errorf("failed while deleting service keys from Redis: %w", err)
	}

	return nil
}
