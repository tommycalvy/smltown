package service

import (
	"context"
	"time"

	"github.com/tommycalvy/forefinder/crud-service/post"
	"github.com/tommycalvy/forefinder/crud-service/user"
)

type Service interface {
	CreateUser(ctx context.Context, u user.User) error
	GetUserByUsername(ctx context.Context, username string) (user.User, error)
	GetUserByEmail(ctx context.Context, email string) (user.User, error)
	CreatePost(ctx context.Context, p post.Post) error
	//SearchProfilesByDistance(ctx context.Context, lat float64, lon float64, miles int) ([]profile.Profile, error)

	//CreatePost(ctx context.Context, p profile.Profile)
}

type service struct {
	users 				user.Repository
	posts 				post.Repository
}

func NewService(users user.Repository, posts post.Repository) Service {
	return &service {
		users: users,
		posts: posts,
	}
}
func (s *service) CreateUser(ctx context.Context, u user.User) error {
	
	if err := s.users.CreateUser(ctx, u); err != nil {
		return err
	}
	return nil
}

func (s *service) GetUserByUsername(ctx context.Context, username string) (user.User, error) {
	u, err := s.users.GetUserByUsername(ctx, username)
	if err != nil {
		return user.User{}, err
	}
	return u, nil
}

func (s *service) GetUserByEmail(ctx context.Context, email string) (user.User, error) {
	u, err := s.users.GetUserByEmail(ctx, email)
	if err != nil {
		return user.User{}, err
	}
	return u, nil
}

func (s *service) CreatePost(ctx context.Context, p post.Post) error {
	p.Timestamp = time.Now().UnixNano()
	if err := s.posts.CreatePost(ctx, p); err != nil {
		return err
	}
	return nil
}


/*
func (s *service) SearchProfilesByDistance(ctx context.Context, lat float64, lon float64, miles int) ([]profile.Profile, error) {

	milesToMeters := 1609.344
	meters := float64(miles) * milesToMeters

	profiles, err := s.profiles.SearchProfilesByDistance(ctx, lat, lon, int(meters))
	if err != nil {
		return profiles, err
	}
	return profiles, nil
}
*/