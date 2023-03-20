package post

import "context"

type Post struct {
	Username 		string	`json:"Username,omitempty"`
	Timestamp		int64	`json:"Timestamp,omitempty"`
	Title			string	`json:"Title,omitempty"`
	Body			string	`json:"Body,omitempty"`
	Channel1		string	`json:"Channel1,omitempty"`
	Channel2		string	`json:"Channel2,omitempty"`
	Latitude 		int64	`json:"Latitude,omitempty"`
	Longitude		int64	`json:"Longitude,omitempty"`
	Votes			int64	`json:"Votes,omitempty"`
}

type Repository interface {
	CreatePost(ctx context.Context, p Post) error
}