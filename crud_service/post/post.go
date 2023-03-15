package post

import "context"

type Post struct {
	Username 		string	`json:"Username,omitempty"`
	Timestamp		int64	`json:"Timestamp,omitempty"`
	Title			string	`json:"Title,omitempty"`
	Body			string	`json:"Body,omitempty"`
	Category1		string	`json:"Category1,omitempty"`
	Category2		string	`json:"Category2,omitempty"`
	Latitude 		int64	`json:"Latitude,omitempty"`
	Longitude		int64	`json:"Longitude,omitempty"`
}

type Repository interface {
	CreatePost(ctx context.Context, p Post) error
}