package service

import (
	"context"

	"github.com/go-kit/kit/endpoint"
	"github.com/tommycalvy/forefinder/crud-service/post"
	"github.com/tommycalvy/forefinder/crud-service/user"
)

type Endpoints struct {
	CreateUserEndpoint 					endpoint.Endpoint
	GetUserByUsernameEndpoint 			endpoint.Endpoint
	GetUserByEmailEndpoint 				endpoint.Endpoint
	CreatePostEndpoint 					endpoint.Endpoint 
	
	//SearchProfilesByDistanceEndpoint 	endpoint.Endpoint
}

func MakeEndpoints(s Service) Endpoints {
	return Endpoints {
		CreateUserEndpoint: 				MakeCreateUserEndpoint(s),
		GetUserByUsernameEndpoint: 			MakeGetUserByUsernameEndpoint(s),
		GetUserByEmailEndpoint:		 		MakeGetUserByEmailEndpoint(s),			
		CreatePostEndpoint:					MakeCreatePostEndpoint(s),
		//SearchProfilesByDistanceEndpoint: 	MakeSearchProfilesByDistanceEndpoint(s),
	}
}

func MakeCreateUserEndpoint(s Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (response interface{}, err error) {
		req := request.(createUserRequest)
		e := s.CreateUser(ctx, req.User)
		return createUserResponse{Err: e}, nil
	}
}

func MakeGetUserByUsernameEndpoint(s Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (response interface{}, err error) {
		req := request.(getUserByUsernameRequest)
		u, e := s.GetUserByUsername(ctx, req.Username)
		return getUserResponse{User: u, Err: e}, nil
	}
}

func MakeGetUserByEmailEndpoint(s Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (response interface{}, err error) {
		req := request.(getUserByEmailRequest)
		u, e := s.GetUserByEmail(ctx, req.Email)
		return getUserResponse{User: u, Err: e}, nil
	}
}

func MakeCreatePostEndpoint(s Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (response interface{}, err error) {
		req := request.(createPostRequest)
		e := s.CreatePost(ctx, req.Post)
		return createPostResponse{Err: e}, nil
	}
}


/*
func MakeSearchProfilesByDistanceEndpoint(s Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (response interface{}, err error) {
		req := request.(searchProfilesByDistanceRequest)
		profiles, e := s.SearchProfilesByDistance(ctx, req.CountryCode, req.PostalCode, req.Miles)
		return searchProfilesByDistanceResponse{Profiles: profiles, Err: e}, nil
	}
}
*/

type (
	createUserRequest struct {
		User 				user.User 				
	}
	createUserResponse struct {
		Err 				error					`json:"error,omitempty"`
	}
	getUserByUsernameRequest struct {
		Username 			string
	}
	getUserByEmailRequest struct {
		Email 				string
	}
	getUserResponse struct {
		User 				user.User 				`json:"user,omitempty"`
		Err 				error					`json:"error,omitempty"`
	}
	createPostRequest struct {
		Post 				post.Post
	}
	createPostResponse struct {
		Err 				error					`json:"error,omitempty"`
	}

	/*
	searchProfilesByDistanceRequest struct {
		CountryCode 		string
		PostalCode 			string
		Miles 				int
	}
	searchProfilesByDistanceResponse struct {
		Profiles 			[]profile.Profile 		`json:"profiles,omitempty"`
		Err 				error					`json:"error,omitempty"`
	}
	*/
)