package user

import (
	"context"
)

type User struct {
	Username 			string 	`json:"Username,omitempty"`
	Email 				string	`json:"Email,omitempty"`
	Admin				bool	`json:"Admin,omitempty"`
}

type Repository interface {
	CreateUser(ctx context.Context, u User) error
	GetUserByUsername(ctx context.Context, username string) (User, error)
	GetUserByEmail(ctx context.Context, email string) (User, error)
}