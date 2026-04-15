package api

import (
	"net/http"

	db "github.com/SantGT5/mydaily/db/sqlc"
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
	}

	user, err := server.store.CreateUser(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, UserToResponse(user))
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
