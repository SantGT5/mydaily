package redis

import (
	"fmt"

	"github.com/SantGT5/mydaily/config"
	"github.com/go-redis/redis_rate/v10"
)

var LimiterRedisClient = NewRedisClient(config.LimiterRedisURL)

// IPPathRateLimiter rate-limits by arbitrary string keys (middleware uses IP + path).
var IPPathRateLimiter = redis_rate.NewLimiter(LimiterRedisClient)

type RateLimitWindow string

const (
	RateLimitPerMinute RateLimitWindow = "minute"
	RateLimitPerHour   RateLimitWindow = "hour"
)

// LimitForWindow maps our window enum to a redis_rate limit (token bucket).
func LimitForWindow(requests int, window RateLimitWindow) (redis_rate.Limit, error) {
	if requests <= 0 {
		return redis_rate.Limit{}, fmt.Errorf("requests must be greater than 0")
	}

	switch window {
	case RateLimitPerMinute:
		return redis_rate.PerMinute(requests), nil
	case RateLimitPerHour:
		return redis_rate.PerHour(requests), nil
	default:
		return redis_rate.Limit{}, fmt.Errorf("invalid rate limit window: %s", window)
	}
}
