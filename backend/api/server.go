package api

import (
	"github.com/SantGT5/mydaily/config"
	db "github.com/SantGT5/mydaily/db/sqlc"
	_ "github.com/SantGT5/mydaily/docs"
	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Server struct {
	store  db.Store
	router *gin.Engine
}

func NewServer(store db.Store) *Server {
	server := &Server{store: store}
	router := gin.Default()

	users := router.Group("/users")
	{
		users.POST("/", server.createUser)
		users.GET("/:id/", server.getUserById)
	}

	if config.IsDebug {
		router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))
	}

	server.router = router

	return server
}

// Start runs the HTTP server on a specific address
func (server *Server) Start(address string) error {
	return server.router.Run(address)
}
