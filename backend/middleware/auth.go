package middleware

import (
	"net/http"

	db "github.com/SantGT5/mydaily/db/sqlc"
	"github.com/SantGT5/mydaily/redis"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func IsLoggedIn(store db.Store) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		sessionToken := ctx.GetHeader("X-Session")
		if sessionToken == "" {
			ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
			ctx.Abort()
			return
		}

		sessionValues, err := redis.GetSessionToken(ctx, sessionToken, true, "")
		if err != nil || len(sessionValues) == 0 {
			ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
			ctx.Abort()
			return
		}

		userID, err := uuid.Parse(sessionValues[0])
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
			ctx.Abort()
			return
		}

		user, err := store.GetUserById(ctx, userID)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
			ctx.Abort()
			return
		}

		ctx.Set("loggedInUser", user)

		ctx.Next()
	}
}

func IsAdmin(store db.Store) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userInterface, exists := ctx.Get("loggedInUser")
		if !exists {
			ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "You don't have permission to access this resource."})
			ctx.Abort()
			return
		}

		user := userInterface.(db.User)
		if user.Role != db.UserRoleAdmin {
			ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "You don't have permission to access this resource."})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}
