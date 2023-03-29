package post

import (
	"context"
	"errors"
)

type Post struct {
	Username 		string	`json:"username"`
	Timestamp		int64	`json:"timestamp"`
	Title			string	`json:"title"`
	Body			string	`json:"body"`
	Channel1		string	`json:"channel1"`
	Channel2		string	`json:"channel2"`
	Latitude 		string	`json:"latitude,omitempty"`
	Longitude		string	`json:"longitude,omitempty"`
	Votes			int64	`json:"votes"`
}

type Filter struct {
	Timestamp		int64   `json:"timestamp,omitempty"`    
    Latitude		string   `json:"latitude,omitempty"`    
    Longitude		string	`json:"longitude,omitempty"`
    Channel1		string	`json:"channel1,omitempty"`
    Channel2		string	`json:"channel2,omitempty"`
    Georange		int64	`json:"georange,omitempty"`
	Minresults 		int64	`json:"minresults,omitempty"`
}

type PostID struct {
	Username		string	`json:"username,omitempty"`
	Timestamp		int64	`json:"timestamp,omitempty"`
}

type DynamoRepository interface {
	CreatePost(ctx context.Context, p Post) error
	DeletePost(ctx context.Context, id PostID) error
	GetPostsFromIDs(ctx context.Context, postIDs []PostID) ([]Post, error)
}

type FilterServiceRepository interface {
	AddPost(ctx context.Context, p Post) error
	GetHotPostsNearMe(ctx context.Context, f Filter) ([]PostID, error)
	CloseConn()
}

var (
	ErrInvalidArgument 	= errors.New("invalid argument")
	ErrNotFound        	= errors.New("not found")
	ErrRepo 			= errors.New("unable to handle repo request")
)