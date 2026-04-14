package api

import (
	"net/http"
	"time"

	db "github.com/SantGT5/mydaily/db/sqlc"
	"github.com/gin-gonic/gin"
)

// ErrorResponse is used in Swagger for JSON error bodies.
type ErrorResponse struct {
	Error string `json:"error"`
}

type CreateUserRequest struct {
	FullName string `json:"full_name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}

// UserResponse is the JSON shape for user endpoints (avoids sql.NullString in swag).
type UserResponse struct {
	ID              string    `json:"id"`
	FullName        string    `json:"full_name"`
	Email           string    `json:"email"`
	IsActive        bool      `json:"is_active"`
	IsEmailVerified bool      `json:"is_email_verified"`
	CreatedAt       string    `json:"created_at"`
	UpdatedAt       string    `json:"updated_at"`
}

// @Summary Create a new user
// @Description Create a new user
// @Accept json
// @Produce json
// @Param user body CreateUserRequest true "User to create"
// @Success 200 {object} UserResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /users/create/ [post]
// @Tags users
func (server *Server) createUser(ctx *gin.Context) {
	var req CreateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	arg := db.CreateUserParams{
		FullName: req.FullName,
		Email:    req.Email,
	}

	user, err := server.store.CreateUser(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, userToResponse(user))
}

func userToResponse(u db.User) UserResponse {
	return UserResponse{
		ID:              u.ID.String(),
		FullName:        u.FullName,
		Email:           u.Email,
		IsActive:        u.IsActive,
		IsEmailVerified: u.IsEmailVerified,
		CreatedAt:       u.CreatedAt.Format(time.RFC3339Nano),
		UpdatedAt:       u.UpdatedAt.Format(time.RFC3339Nano),
	}
}
