package middleware

import (
	"fmt"
	"math"
	"net/http"
	"strconv"

	redisClient "github.com/SantGT5/mydaily/redis"
	"github.com/gin-gonic/gin"
)

type RateLimitErrorResponse struct {
	Error string `json:"error"`
}

// rateLimitPath returns a stable path for the key: Gin route template when available,
// otherwise the raw URL path (e.g. early middleware or no match).
func rateLimitPath(ctx *gin.Context) string {
	if p := ctx.FullPath(); p != "" {
		return p
	}

	return ctx.Request.URL.Path
}

func rateLimitKey(ip, path string) string {
	return fmt.Sprintf("%s|%s", ip, path)
}

// RateLimitByIP limits requests per client IP for each path independently (IP + path key).
// Exceeding the limit on one endpoint does not block other endpoints.
func RateLimitByIP(limit int, window redisClient.RateLimitWindow) gin.HandlerFunc {
	redisLimit, err := redisClient.LimitForWindow(limit, window)
	if err != nil {
		return func(ctx *gin.Context) {
			ctx.JSON(http.StatusInternalServerError, RateLimitErrorResponse{
				Error: "invalid rate limit configuration",
			})
			ctx.Abort()
		}
	}

	return func(ctx *gin.Context) {
		ip := ctx.ClientIP()
		path := rateLimitPath(ctx)
		key := rateLimitKey(ip, path)

		res, err := redisClient.IPPathRateLimiter.Allow(ctx, key, redisLimit)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, RateLimitErrorResponse{
				Error: "failed to process rate limit",
			})
			ctx.Abort()
			return
		}

		ctx.Header("X-RateLimit-Limit", strconv.Itoa(limit))
		ctx.Header("X-RateLimit-Remaining", strconv.Itoa(res.Remaining))
		if res.ResetAfter > 0 {
			ctx.Header("X-RateLimit-Reset", strconv.FormatInt(int64(math.Ceil(res.ResetAfter.Seconds())), 10))
		}

		if res.Allowed == 0 {
			if res.RetryAfter > 0 {
				ctx.Header("Retry-After", strconv.Itoa(int(math.Ceil(res.RetryAfter.Seconds()))))
			}

			ctx.JSON(http.StatusTooManyRequests, RateLimitErrorResponse{
				Error: "rate limit exceeded",
			})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}
