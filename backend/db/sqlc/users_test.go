package db_test

import (
	"context"
	"database/sql"
	"errors"
	"reflect"
	"testing"
	"time"

	mockdb "github.com/SantGT5/mydaily/db/mock"
	db "github.com/SantGT5/mydaily/db/sqlc"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

func mockUserFixture(now time.Time) db.User {
	return db.User{
		ID:              uuid.MustParse("8cb91267-4a2f-4d37-9387-f1f7df8efefe"),
		HashedPassword:  sql.NullString{String: "hashed-password", Valid: true},
		FullName:        "Test User",
		Email:           "test@example.com",
		IsActive:        true,
		IsEmailVerified: false,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

func TestUserStore_CreateAndGet(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	store := mockdb.NewMockStore(ctrl)
	ctx := context.Background()
	now := time.Date(2026, time.April, 14, 9, 0, 0, 0, time.UTC)
	user := mockUserFixture(now)

	createArg := db.CreateUserParams{
		FullName: user.FullName,
		Email:    user.Email,
	}

	store.EXPECT().CreateUser(ctx, createArg).Times(1).Return(user, nil)
	store.EXPECT().GetUserByEmail(ctx, user.Email).Times(1).Return(user, nil)
	store.EXPECT().GetUserById(ctx, user.ID).Times(1).Return(user, nil)

	created, err := store.CreateUser(ctx, createArg)
	if err != nil {
		t.Fatalf("CreateUser() error = %v", err)
	}
	if created != user {
		t.Fatalf("CreateUser() got %+v, want %+v", created, user)
	}

	byEmail, err := store.GetUserByEmail(ctx, user.Email)
	if err != nil {
		t.Fatalf("GetUserByEmail() error = %v", err)
	}
	if byEmail != user {
		t.Fatalf("GetUserByEmail() got %+v, want %+v", byEmail, user)
	}

	byID, err := store.GetUserById(ctx, user.ID)
	if err != nil {
		t.Fatalf("GetUserById() error = %v", err)
	}
	if byID != user {
		t.Fatalf("GetUserById() got %+v, want %+v", byID, user)
	}
}

func TestUserStore_GetUsers(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	store := mockdb.NewMockStore(ctrl)
	ctx := context.Background()
	now := time.Date(2026, time.April, 14, 9, 0, 0, 0, time.UTC)
	user := mockUserFixture(now)

	arg := db.GetUsersParams{
		Search:           sql.NullString{String: "test", Valid: true},
		OrderBy:          sql.NullString{String: "created_at", Valid: true},
		OrderDir:         sql.NullString{String: "desc", Valid: true},
		LimitRows:        sql.NullInt32{Int32: 10, Valid: true},
		OffsetRows:       sql.NullInt32{Int32: 1, Valid: true},
		ExcludeSensitive: sql.NullBool{Bool: true, Valid: true},
	}
	want := []db.GetUsersRow{
		{
			ID:              user.ID,
			HashedPassword:  nil,
			FullName:        user.FullName,
			Email:           user.Email,
			IsActive:        user.IsActive,
			IsEmailVerified: user.IsEmailVerified,
			CreatedAt:       user.CreatedAt,
			UpdatedAt:       user.UpdatedAt,
		},
	}

	store.EXPECT().GetUsers(ctx, arg).Times(1).Return(want, nil)

	got, err := store.GetUsers(ctx, arg)
	if err != nil {
		t.Fatalf("GetUsers() error = %v", err)
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("GetUsers() got %+v, want %+v", got, want)
	}
}

func TestUserStore_ErrorPropagation(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	store := mockdb.NewMockStore(ctrl)
	ctx := context.Background()

	createArg := db.CreateUserParams{
		FullName: "Test User",
		Email:    "test@example.com",
	}
	errCreate := errors.New("create user failed")
	store.EXPECT().CreateUser(ctx, createArg).Times(1).Return(db.User{}, errCreate)

	if _, err := store.CreateUser(ctx, createArg); !errors.Is(err, errCreate) {
		t.Fatalf("CreateUser() error = %v, want %v", err, errCreate)
	}

	deleteEmail := "missing@example.com"
	errDelete := errors.New("delete user failed")
	store.EXPECT().SoftDeleteUserByEmail(ctx, deleteEmail).Times(1).Return(errDelete)

	if err := store.SoftDeleteUserByEmail(ctx, deleteEmail); !errors.Is(err, errDelete) {
		t.Fatalf("SoftDeleteUserByEmail() error = %v, want %v", err, errDelete)
	}
}
