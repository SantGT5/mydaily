package api

import (
	"net/http"

	"github.com/SantGT5/mydaily/config"
	"github.com/SantGT5/mydaily/redis"
	"github.com/SantGT5/mydaily/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// @Summary Login
// @Description Login to the system
// @Tags Auth
// @Accept json
// @Produce json
// @Param login_request body LoginRequest true "Login request"
// @Success 200 {object} LoginResponse
// @Failure 400 {object} ValidationErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /auth/login/ [post]
func (server *Server) Login(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		if fields, ok := utils.ValidationErrors(err); ok {
			ctx.JSON(http.StatusBadRequest, ValidationErrorResponse{ValidationError: fields})
			return
		}
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid email or password."})
		return
	}

	user, err := server.store.GetUserByEmail(ctx, req.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Invalid email or password."})
		return
	}

	if user.ID == uuid.Nil || user.HashedPassword.String == "" || !user.IsActive || !user.IsEmailVerified {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Invalid email or password."})
		return
	}

	valid := utils.VerifyPassword(req.Password, user.HashedPassword.String)
	if !valid {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Invalid email or password."})
		return
	}

	// TODO: delete previous session token

	sessionToken, err := redis.StoreSessionToken(ctx, true, user.ID.String(), config.SessionExpiresTime, "")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong while creating the session token."})
		return
	}

	ctx.JSON(http.StatusOK, LoginToResponse(sessionToken))
}
