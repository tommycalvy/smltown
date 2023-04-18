package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/go-kit/kit/transport"
	httptransport "github.com/go-kit/kit/transport/http"
	"github.com/go-kit/log"
	"github.com/gorilla/mux"
)

var (
	// ErrBadRouting is returned when an expected path variable is missing.
	// It always indicates programmer error.
	ErrBadRouting = errors.New("inconsistent mapping between route and handler (programmer error)")
)

func MakeHTTPHandler(s Service, logger log.Logger) http.Handler {
	r := mux.NewRouter()
	e := MakeEndpoints(s)
	options := []httptransport.ServerOption{
		httptransport.ServerErrorHandler(transport.NewLogErrorHandler(logger)),
		httptransport.ServerErrorEncoder(encodeError),
	}

	// POST 	/users/v0/ 								adds another user
	// GET 		/users/v0/username/:username 			get user by username
	// GET 		/users/v0/email/:email 					get user by email

	// POST		/posts/v0/								creates a post

	// GET 		/profiles/v0/distance/:cc/:pc/:miles	finds profiles within a certain mile radius around a lat, lon
	
	
	r.Methods("POST").Path("/users/v0/").Handler(httptransport.NewServer(
		e.CreateUserEndpoint,
		decodeCreateUserRequest,
		encodeResponse,
		options...,
	))
	r.Methods("GET").Path("/users/v0/username/{username}").Handler(httptransport.NewServer(
		e.GetUserByUsernameEndpoint,
		decodeGetUserByUsernameRequest,
		encodeResponse,
		options...,
	))
	r.Methods("Get").Path("/users/v0/email/{email}").Handler(httptransport.NewServer(
		e.GetUserByEmailEndpoint,
		decodeGetUserByEmailRequest,
		encodeResponse,
		options...,
	))
	r.Methods("POST").Path("/posts/v0/").Handler(httptransport.NewServer(
		e.CreatePostEndpoint,
		decodeCreatePostRequest,
		encodeResponse,
		options...,
	))
	r.Methods("POST").Path("/posts/v0/gethotpostsnearme").Handler(httptransport.NewServer(
		e.GetHotPostsNearMeEndpoint,
		decodeGetHotPostsNearMeRequest,
		encodeResponse,
		options...,
	))
	
	return r 
}

func decodeCreateUserRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req createUserRequest
	fmt.Println("r.Body")
	fmt.Println(r.Body)
	if e := json.NewDecoder(r.Body).Decode(&req); e != nil {
		return nil, e
	}
	fmt.Println("req.User")
	fmt.Println(req.User)
	return req, nil
}

func decodeGetUserByUsernameRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	vars := mux.Vars(r)
	username, ok := vars["username"]
	if !ok {
		return nil, ErrBadRouting
	}
	return getUserByUsernameRequest{Username: username}, nil
}

func decodeGetUserByEmailRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	vars := mux.Vars(r)
	email, ok := vars["email"]
	if !ok {
		return nil, ErrBadRouting
	}
	return getUserByEmailRequest{Email: email}, nil
}

func decodeCreatePostRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req createPostRequest
	if e := json.NewDecoder(r.Body).Decode(&req); e != nil {
		return nil, e
	}
	return req, nil
}

func decodeGetHotPostsNearMeRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req getHotPostsNearMeRequest
	if e := json.NewDecoder(r.Body).Decode(&req); e != nil {
		return nil, e
	}
	return req, nil
}

// errorer is implemented by all concrete response types that may contain
// errors. It allows us to change the HTTP response code without needing to
// trigger an endpoint (transport-level) error. For more information, read the
// big comment in endpoints.go. -comment from profilesvc/transport.go example
type errorer interface {
	error() error
}

// encodeResponse is the common method to encode all response types to the
// client. I chose to do it this way because, since we're using JSON, there's no
// reason to provide anything more specific. It's certainly possible to
// specialize on a per-response (per-method) basis. -comment from profilesvc/transport.go example
func encodeResponse(ctx context.Context, w http.ResponseWriter, response interface{}) error {
	if e, ok := response.(errorer); ok && e.error() != nil {
		// Not a Go kit transport error, but a business-logic error.
		// Provide those as HTTP errors.
		encodeError(ctx, e.error(), w)
		return nil
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	return json.NewEncoder(w).Encode(response)
}

func encodeError(_ context.Context, err error, w http.ResponseWriter) {
	if err == nil {
		panic("encodeError with nil error")
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(codeFrom(err))
	json.NewEncoder(w).Encode(map[string]interface{}{
		"error": err.Error(),
	})
}

var (
	ErrInvalidArgument 	= errors.New("invalid argument")
	ErrNotFound        	= errors.New("not found")
	ErrRepo 			= errors.New("unable to handle repo request")
)

func codeFrom(err error) int {
	switch err {
	case ErrNotFound:
		return http.StatusNotFound
	case ErrInvalidArgument:
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}