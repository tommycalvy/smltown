package post

import (
	"context"

	"log"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)


type dynamoRepo struct {
	Dynamo 			*dynamodb.Client
	TableName 		string
}

func NewDynamoPostRepo(tableName string) DynamoRepository {
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

	return &dynamoRepo{
		Dynamo:		dynamo,
		TableName:  tableName,
	}
}

func (r *dynamoRepo) CreatePost(ctx context.Context, p Post) error {
	log.Printf("Username=%v", p.Username)
	log.Printf("Timestamp=%v", p.Timestamp)
	log.Printf("Title=%v", p.Title)
	log.Printf("Body=%v", p.Body)
	log.Printf("Channel1=%v", p.Channel1)
	log.Printf("Channel2=%v", p.Channel2)
	log.Printf("Latitude=%v", p.Latitude)
	log.Printf("Longitude=%v", p.Longitude)
	log.Printf("Votes=%v", p.Votes)
	
	input := &dynamodb.PutItemInput{
		TableName: aws.String(r.TableName),
		Item: map[string]types.AttributeValue {
			"PK": 			&types.AttributeValueMemberS{Value: "p|" + p.Username},
			"SK":			&types.AttributeValueMemberN{Value: strconv.FormatInt(p.Timestamp, 10)},
			"Metadata":		&types.AttributeValueMemberS{Value: p.Title},
			"Body": 		&types.AttributeValueMemberS{Value: p.Body},
			"Channel1":		&types.AttributeValueMemberS{Value: p.Channel1},
			"Channel2":		&types.AttributeValueMemberS{Value: p.Channel2},
			"Latitude":		&types.AttributeValueMemberN{Value: strconv.FormatInt(p.Latitude, 10)},
			"Longitude":	&types.AttributeValueMemberN{Value: strconv.FormatInt(p.Longitude, 10)},
			"Votes":		&types.AttributeValueMemberN{Value: strconv.FormatInt(p.Votes, 10)},
		},
	}
	_, err := r.Dynamo.PutItem(ctx, input)
	if err != nil {
		log.Printf("Got error calling PutItem: %s", err)
		return ErrRepo
	}

	return nil
}

func (r *dynamoRepo) DeletePost(ctx context.Context, id PostID) error {
	input := &dynamodb.DeleteItemInput{
		TableName: aws.String(r.TableName),
		Key: map[string]types.AttributeValue {
			"p|" + id.Username  : &types.AttributeValueMemberN{Value: strconv.FormatInt(id.Timestamp, 10)},
		},
	}
	_, err := r.Dynamo.DeleteItem(ctx, input)
	if err != nil {
		return err
	}
	return nil
}

func (r *dynamoRepo) GetPostsFromIDs(ctx context.Context, postIDs []PostID) ([]Post, error) {
	keyval := make([]map[string]types.AttributeValue, len(postIDs))
	for i, postid := range postIDs {
		keyval[i] = map[string]types.AttributeValue {
			"p|" + postid.Username: &types.AttributeValueMemberN{Value: strconv.FormatInt(postid.Timestamp, 10)},
		}
	}
	input := &dynamodb.BatchGetItemInput{
		RequestItems: map[string]types.KeysAndAttributes{
            r.TableName: {
                Keys: keyval,
            },
        },
	}
	out, err := r.Dynamo.BatchGetItem(ctx, input)
	if err != nil {
		log.Printf("Got error calling BatchGetItem: %s", err)
		return nil, ErrRepo
	}

	posts := make([]Post, len(out.Responses[r.TableName]))

	if len(out.Responses[r.TableName]) == 0 {
		return nil, ErrNotFound
	}
	for i, post := range out.Responses[r.TableName] {
		err := attributevalue.UnmarshalMap(post, posts[i])
		if err != nil {
			log.Printf("Failed to unmarshal Record, %v", err)
			return nil, ErrRepo
		}
	}
	return posts, nil
}