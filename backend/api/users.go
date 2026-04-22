package api

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/SantGT5/mydaily/config"
	db "github.com/SantGT5/mydaily/db/sqlc"
	"github.com/SantGT5/mydaily/mq"
	"github.com/SantGT5/mydaily/redis"
	"github.com/SantGT5/mydaily/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// @Summary Create a new user
// @Description Create a new user
// @Accept json
// @Produce json
// @Param user body CreateUserRequest true "User to create"
// @Success 200 {object} UserResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /users/ [post]
// @Tags users
func (server *Server) createUser(ctx *gin.Context) {
	var req CreateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		if fields, ok := utils.ValidationErrors(err); ok {
			ctx.JSON(http.StatusBadRequest, ValidationErrorResponse{ValidationError: fields})
			return
		}
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	getUser, _ := server.store.GetUserByEmail(ctx, req.Email)

	if getUser.Email != "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "User already exists."})
		return
	}

	arg := db.CreateUserParams{
		FullName: req.FullName,
		Email:    req.Email,
		Role:     db.UserRole(req.Role),
	}

	user, err := server.store.CreateUser(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	token, err := redis.StoreMailToken(ctx, true, user.ID.String(), config.MailExpiresTime, redis.MailTokenConfirmEmail)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong while sending the welcome email."})
		return
	}

	err = mq.PostMessage(mq.QueueActivateUserAccountEmail, map[string]any{
		"email":     user.Email,
		"full_name": user.FullName,
		"token":     token,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong while sending the welcome email."})
		return
	}

	ctx.JSON(http.StatusOK, UserToResponse(user))
}

// @Summary Validate a user email token
// @Description Validate a user email token
// @Accept json
// @Produce json
// @Param token path string true "Token"
// @Success 200 {object} UserResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /users/validate-email-token/{token}/ [get]
// @Tags users
func (server *Server) ValidateUserEmailToken(ctx *gin.Context) {
	token := ctx.Param("token")

	mailTokens, err := redis.GetMailToken(ctx, token, true, redis.MailTokenConfirmEmail)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, false)
		return
	}

	if len(mailTokens) == 0 {
		ctx.JSON(http.StatusBadRequest, false)
		return
	}

	userID, err := uuid.Parse(mailTokens[0])
	if err != nil {
		ctx.JSON(http.StatusBadRequest, false)
		return
	}

	user, err := server.store.GetUserById(ctx, userID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, false)
		return
	}

	if user.ID == uuid.Nil {
		ctx.JSON(http.StatusBadRequest, false)
		return
	}

	ctx.JSON(http.StatusOK, true)
}

// @Summary Activate a user
// @Description Activate a user
// @Accept json
// @Produce json
// @Param user body ActivateUserRequest true "User to activate"
// @Success 200 {object} bool
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /users/activate/ [post]
// @Tags users
func (server *Server) ActivateUser(ctx *gin.Context) {
	var req ActivateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		if fields, ok := utils.ValidationErrors(err); ok {
			ctx.JSON(http.StatusBadRequest, ValidationErrorResponse{ValidationError: fields})
			return
		}
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	if !utils.IsValidPassword(req.Password) {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Password pattern is not valid."})
		return
	}

	mailTokens, err := redis.GetMailToken(ctx, req.Token, true, redis.MailTokenConfirmEmail)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Something went wrong while validation."})
		return
	}

	if len(mailTokens) == 0 {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Something went wrong while validation."})
		return
	}

	userID, err := uuid.Parse(mailTokens[0])
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Something went wrong while validation."})
		return
	}

	user, err := server.store.GetUserById(ctx, userID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Something went wrong while validation."})
		return
	}

	if user.ID == uuid.Nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Something went wrong while validation."})
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong while validation."})
		return
	}

	arg := db.ActivateUserParams{
		ID:             user.ID,
		HashedPassword: sql.NullString{String: hashedPassword, Valid: true},
	}

	activatedUser, err := server.store.ActivateUser(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong while activating the user."})
		return
	}

	err = redis.CleanUserMailKeys(ctx, user.ID.String())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong while deleting the token."})
		return
	}

	err = mq.PostMessage(mq.QueueSuccessActivateUserAccountEmail, map[string]any{
		"email":     user.Email,
		"full_name": user.FullName,
	})
	if err != nil {
		fmt.Println("Something went wrong while sending the successful activation email.")
	}

	ctx.JSON(http.StatusOK, UserToResponse(activatedUser))
}

// @Summary Get a user by ID
// @Description Get a user by ID
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} UserResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /users/{id}/ [get]
// @Tags users
func (server *Server) getUserById(ctx *gin.Context) {
	id := ctx.Param("id")

	userID, err := uuid.Parse(id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid user ID."})
		return
	}

	user, err := server.store.GetUserById(ctx, userID)

	if user.ID == uuid.Nil {
		ctx.JSON(http.StatusNotFound, ErrorResponse{Error: "User not found."})
		return
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, UserToResponse(user))
}
