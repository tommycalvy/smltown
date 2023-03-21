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

type Filter struct {
	Timestamp		int64   `json:"Timestamp,omitempty"`    
    Latitude		int64   `json:"Latitude,omitempty"`    
    Longitude		int64	`json:"Longitude,omitempty"`
    Channel1		string	`json:"Channel1,omitempty"`
    Channel2		string	`json:"Channel2,omitempty"`
    Georange		int64	`json:"Georange,omitempty"`
}

type PostID struct {
	Username		string	`json:"Username,omitempty"`
	Timestamp		int64	`json:"Timestamp,omitempty"`
}

type DynamoRepository interface {
	CreatePost(ctx context.Context, p Post) error
	GetPostsFromIDs(ctx context.Context, postIDs []PostID) ([]Post, error)
}

type FilterServiceRepository interface {
	AddPost(ctx context.Context, p Post) error
	GetHotPostsNearMe(ctx context.Context, f Filter) ([]PostID, error)
}