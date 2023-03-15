package service

import (
	"context"
	"time"

	"github.com/go-kit/kit/log"
	"github.com/tommycalvy/forefinder/crud-service/post"
	"github.com/tommycalvy/forefinder/crud-service/user"
)

type loggingService struct {
	logger log.Logger
	Service
}

// NewLoggingService returns a new instance of a logging Service.
func NewLoggingService(logger log.Logger, s Service) Service {
	return &loggingService{logger, s}
}

func (s *loggingService) CreateUser(ctx context.Context, u user.User) (err error) {
	defer func(begin time.Time) {
		s.logger.Log("method", "CreateUser", "username", u.Username, "took", time.Since(begin), "err", err)
	}(time.Now())
	return s.Service.CreateUser(ctx, u)
}

func (s *loggingService) GetUserByUsername(ctx context.Context, username string) (u user.User, err error) {
	defer func(begin time.Time) {
		s.logger.Log("method", "GetUserByUsername", "username", username, "took", time.Since(begin), "err", err)
	}(time.Now())
	return s.Service.GetUserByUsername(ctx, username)
}

func (s *loggingService) GetUserByEmail(ctx context.Context, email string) (u user.User, err error) {
	defer func(begin time.Time) {
		s.logger.Log("method", "GetUserByUsername", "email", email, "took", time.Since(begin), "err", err)
	}(time.Now())
	return s.Service.GetUserByEmail(ctx, email)
}

func (s *loggingService) CreatePost(ctx context.Context, p post.Post) (err error) {
	defer func(begin time.Time) {
		s.logger.Log("method", "CreatePost", "username", p.Username, "took", time.Since(begin), "err", err)
	}(time.Now())
	return s.Service.CreatePost(ctx, p)
}



/*
func (s *loggingService) SearchProfilesByDistance(ctx context.Context, countryCode string, postalCode string, miles int) (p []profile.Profile, err error) {
	defer func(begin time.Time) {
		s.logger.Log("method", "SearchProfilesByDistance", "countryCode", countryCode, "postalCode", postalCode, "miles", miles, "took", time.Since(begin), "err", err)
	}(time.Now())
	return s.Service.SearchProfilesByDistance(ctx, countryCode, postalCode, miles)
}
*/