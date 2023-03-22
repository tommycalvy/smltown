package service

import (
	"context"
	"time"

	"github.com/tommycalvy/smltown/crud_service/post"
	"github.com/tommycalvy/smltown/crud_service/user"
)

type Service interface {
	CreateUser(ctx context.Context, u user.User) error
	GetUserByUsername(ctx context.Context, username string) (user.User, error)
	GetUserByEmail(ctx context.Context, email string) (user.User, error)
	CreatePost(ctx context.Context, p post.Post) error
	GetHotPostsNearMe(ctx context.Context, f post.Filter) ([]post.Post, error)
}

type service struct {
	users 					user.Repository
	dynamoPosts 			post.DynamoRepository
	filterServicePosts		post.FilterServiceRepository
}

func NewService(users user.Repository, dynamoPosts post.DynamoRepository, filterServicePosts post.FilterServiceRepository) Service {
	return &service {
		users: users,
		dynamoPosts: dynamoPosts,
		filterServicePosts: filterServicePosts,
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
	if err := s.dynamoPosts.CreatePost(ctx, p); err != nil {
		return err
	}
	return nil
}

func (s *service) GetHotPostsNearMe(ctx context.Context, f post.Filter) ([]post.Post, error) {
	postIDs, err := s.filterServicePosts.GetHotPostsNearMe(ctx, f)
	if err != nil {
		return nil, err
	}
	posts, err := s.dynamoPosts.GetPostsFromIDs(ctx, postIDs)
	if err != nil {
		return nil, err
	}
	return posts, nil
}