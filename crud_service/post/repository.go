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

func (r *repo) CreatePost(ctx context.Context, p Post) error {
	log.Printf("Username=%v", p.Username)
	log.Printf("Timestamp=%v", p.Timestamp)
	log.Printf("Title=%v", p.Title)
	log.Printf("Body=%v", p.Body)
	log.Printf("Channel1=%v", p.Channel1)
	log.Printf("Channel2=%v", p.Channel2)
	log.Printf("Latitude=%v", p.Latitude)
	log.Printf("Longitude=%v", p.Longitude)
	
	input := &dynamodb.PutItemInput{
		TableName: aws.String(r.TableName),
		Item: map[string]types.AttributeValue {
			"PK": 			&types.AttributeValueMemberS{Value: "post|" + p.Username},
			"SK":			&types.AttributeValueMemberN{Value: strconv.FormatInt(p.Timestamp, 10)},
			"Metadata":		&types.AttributeValueMemberS{Value: p.Title},
			"Body": 		&types.AttributeValueMemberS{Value: p.Body},
			"Channel1":		&types.AttributeValueMemberS{Value: p.Channel1},
			"Channel2":		&types.AttributeValueMemberS{Value: p.Channel2},
			"Latitude":		&types.AttributeValueMemberN{Value: strconv.FormatInt(p.Latitude, 10)},
			"Longitude":	&types.AttributeValueMemberN{Value: strconv.FormatInt(p.Longitude, 10)},
		},
	}
	_, err := r.Dynamo.PutItem(ctx, input)
	if err != nil {
		log.Printf("Got error calling PutItem: %s", err)
		return ErrRepo
	}

	return nil
}
