package api

import (
	"time"

	db "github.com/SantGT5/mydaily/db/sqlc"
)

type CreateUserRequest struct {
	FullName string `json:"full_name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Role     string `json:"role" binding:"required,oneof=user admin"`
}

type UserResponse struct {
	ID              string `json:"id"`
	FullName        string `json:"full_name"`
	Email           string `json:"email"`
	Role            string `json:"role"`
	IsActive        bool   `json:"is_active"`
	IsEmailVerified bool   `json:"is_email_verified"`
	CreatedAt       string `json:"created_at"`
	UpdatedAt       string `json:"updated_at"`
}

type ActivateUserRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=8,max=64"`
}

func UserToResponse(user db.User) UserResponse {
	return UserResponse{
		ID:              user.ID.String(),
		FullName:        user.FullName,
		Email:           user.Email,
		Role:            string(user.Role),
		IsActive:        user.IsActive,
		IsEmailVerified: user.IsEmailVerified,
		CreatedAt:       user.CreatedAt.Format(time.RFC3339Nano),
		UpdatedAt:       user.UpdatedAt.Format(time.RFC3339Nano),
	}
}
