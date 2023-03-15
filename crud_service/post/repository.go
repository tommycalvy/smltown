package post

import (
	"context"
	"errors"
	"log"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var (
	ErrInvalidArgument 	= errors.New("invalid argument")
	ErrNotFound        	= errors.New("not found")
	ErrRepo 			= errors.New("unable to handle repo request")
)


type repo struct {
	Dynamo 			*dynamodb.Client
	TableName 		string
}

func NewPostRepo(tableName string) Repository {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		// CHANGE THIS TO us-east-1 TO USE AWS proper
		config.WithRegion("localhost"),
		// Comment the below out if not using localhost
		config.WithEndpointResolver(aws.EndpointResolverFunc(
			func(service, region string) (aws.Endpoint, error) {
				return aws.Endpoint{URL: "http://localhost:8000", SigningRegion: "localhost"}, nil 
			})),
	)
    if err != nil {
        log.Printf("unable to load SDK config, %v", err)
    }

    // Using the Config value, create the DynamoDB client
    dynamo := dynamodb.NewFromConfig(cfg)

	return &repo{
		Dynamo:		dynamo,
		TableName:  tableName,
	}
}

func (r *repo) CreatePost(ctx context.Context, u Post) error {
	log.Printf("Username=%v", u.Username)
	log.Printf("Timestamp=%v", u.Timestamp)
	log.Printf("Title=%v", u.Title)
	log.Printf("Body=%v", u.Body)
	log.Printf("Category1=%v", u.Category1)
	log.Printf("Category2=%v", u.Category2)
	log.Printf("Latitude=%v", u.Latitude)
	log.Printf("Longitude=%v", u.Longitude)
	
	input := &dynamodb.PutItemInput{
		TableName: aws.String(r.TableName),
		Item: map[string]types.AttributeValue {
			"PK": 			&types.AttributeValueMemberS{Value: "post|" + u.Username},
			"SK":			&types.AttributeValueMemberN{Value: strconv.FormatInt(u.Timestamp, 10)},
			"Metadata":		&types.AttributeValueMemberS{Value: u.Title},
			"Body": 		&types.AttributeValueMemberS{Value: u.Body},
			"Category1":	&types.AttributeValueMemberS{Value: u.Category1},
			"Category2":	&types.AttributeValueMemberS{Value: u.Category1},
			"Latitude":		&types.AttributeValueMemberN{Value: strconv.FormatInt(u.Latitude, 10)},
			"Longitude":	&types.AttributeValueMemberN{Value: strconv.FormatInt(u.Longitude, 10)},
		},
	}
	_, err := r.Dynamo.PutItem(ctx, input)
	if err != nil {
		log.Printf("Got error calling PutItem: %s", err)
		return ErrRepo
	}

	return nil
}
