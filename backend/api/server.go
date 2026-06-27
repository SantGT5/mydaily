package api

import (
	"github.com/SantGT5/mydaily/config"
	db "github.com/SantGT5/mydaily/db/sqlc"
	_ "github.com/SantGT5/mydaily/docs"
	"github.com/SantGT5/mydaily/middleware"
	"github.com/SantGT5/mydaily/redis"
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
		users.POST("/", middleware.RateLimitByIP(10, redis.RateLimitPerMinute), server.createUser)
		users.GET("/:id/",
			middleware.RateLimitByIP(20, redis.RateLimitPerMinute),
			middleware.IsLoggedIn(server.store),
			middleware.IsAdmin(server.store),
			server.getUserById)
		users.POST("/activate/", server.ActivateUser)
		users.GET("/validate-email-token/:token/", server.ValidateUserEmailToken)
	}

	auth := router.Group("/auth")
	{
		auth.POST("/login/", server.Login)
		auth.GET("/me/", middleware.IsLoggedIn(server.store), server.Me)
	}

	connect := router.Group("/connect")
	{
		connect.GET("/github/", middleware.IsLoggedIn(server.store), server.ConnectGithub)
		connect.GET("/github/callback/", server.ConnectGithubCallback)
		connect.GET("/github/repos/", middleware.IsLoggedIn(server.store), server.GetRepos)
		connect.GET("/github/commits/", middleware.IsLoggedIn(server.store), server.GetCommits)
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
