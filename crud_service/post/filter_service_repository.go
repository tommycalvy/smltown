package post

import (
	"errors"
	"flag"
	"log"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"google.golang.org/grpc"
)


var (
	serverAddr         = flag.String("addr", "localhost:50051", "The server address in the format of host:port")
	ErrInvalidArgument 	= errors.New("invalid argument")
	ErrNotFound        	= errors.New("not found")
	ErrRepo 			= errors.New("unable to handle repo request")
)


type repo struct {
	client 			*dynamodb.Client
}

func NewFilterServiceRepo() {
	conn, err := grpc.Dial(*serverAddr, opts...)
	if err != nil {
		log.Fatalf("fail to dial: %v", err)
	}
	defer conn.Close()
	client := pb.NewRouteGuideClient(conn)

	return &repo{
		
	}
}