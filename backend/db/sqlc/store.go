package db

import (
	"database/sql"
)

type Store interface {
	Querier
}

// SQLStore provides all functions to execute SQL queries
type SQLStore struct {
	*Queries // this is called composition
	db       *sql.DB
}

// NewStore creates a new Store
func NewStore(db *sql.DB) Store {
	return &SQLStore{
		db:      db,
		Queries: New(db),
	}
}
