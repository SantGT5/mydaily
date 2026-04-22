// @title MyDaily API
// @version 2.0.0
// @description HTTP API for MyDaily with custom X-Session header auth
// @BasePath /api/
// @securityDefinitions.apikey X-Session
// @in header
// @name X-Session
// @description User session token
// @security X-Session
package main

import (
	"database/sql"
	"log"

	"github.com/SantGT5/mydaily/api"
	"github.com/SantGT5/mydaily/config"
	db "github.com/SantGT5/mydaily/db/sqlc"
	_ "github.com/lib/pq"
)

func main() {
	conn, err := sql.Open(config.DbDriver, config.PostgresURL+"?sslmode=disable")

	if err != nil {
		log.Fatal("cannot connect to db: ", err)
	}

	store := db.NewStore(conn)
	server := api.NewServer(store)

	err = server.Start(":" + config.BackendPort)

	if err != nil {
		log.Fatal("cannot start server: ", err)
	}
}
