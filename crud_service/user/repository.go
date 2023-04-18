package user

import (
	"context"
	"errors"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
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

func NewUserRepo(tableName string) Repository {
	cfg, err := config.LoadDefaultConfig(context.TODO())
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

func (r *repo) CreateUser(ctx context.Context, u User) error {
	log.Printf("Username: %v", u.Username)
	log.Printf("Email: %v", u.Email)
	log.Printf("Admin: %v", u.Admin)
	log.Printf("OryId: %v", u.OryId)
	input := &dynamodb.PutItemInput{
		TableName: aws.String(r.TableName),
		Item: map[string]types.AttributeValue {
			"PK": 			&types.AttributeValueMemberS{Value: "u|" + u.Username},
			"SK":			&types.AttributeValueMemberN{Value: "1"},
			"Metadata":		&types.AttributeValueMemberS{Value: u.Email},
			"Admin": 		&types.AttributeValueMemberBOOL{Value: u.Admin},
			"OryId":		&types.AttributeValueMemberS{Value: u.OryId},
		},
	}
	_, err := r.Dynamo.PutItem(ctx, input)
	if err != nil {
		log.Printf("Got error calling PutItem: %s", err)
		return ErrRepo
	}

	return nil
}


func (r *repo) GetUserByUsername(ctx context.Context, username string) (User, error) {
		result, err := r.Dynamo.GetItem(ctx, &dynamodb.GetItemInput{
			TableName: aws.String(r.TableName),
			Key: map[string]types.AttributeValue {
				"ID": 			&types.AttributeValueMemberS{Value: "user|" + username},
				"Metadata":		&types.AttributeValueMemberN{Value: "1"},
			},
		})
		if err != nil {
			log.Printf("Got error calling GetItem: %s", err)
		}
	
		u := User{}
	
		if result.Item == nil {
			return u, ErrNotFound
		}
		
		err = attributevalue.UnmarshalMap(result.Item, &u)
		u.Username = username
		if err != nil {
			log.Printf("Failed to unmarshal Record, %v", err)
			return u, ErrRepo
		}
		
		return u, nil
}

func (r *repo) GetUserByEmail(ctx context.Context, email string) (User, error) {
	result, err := r.Dynamo.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(r.TableName),
		Key: map[string]types.AttributeValue {
			"ID": 			&types.AttributeValueMemberS{Value: "email|" + email},
			"Metadata":		&types.AttributeValueMemberS{Value: "email|" + email},
		},
	})
	if err != nil {
		log.Printf("Got error calling GetItem: %s", err)
	}

	u := User{}

	if result.Item == nil {
		return u, ErrNotFound
	}
		
	err = attributevalue.UnmarshalMap(result.Item, &u)
	if err != nil {
		log.Printf("Failed to unmarshal Record, %v", err)
		return u, ErrRepo
	}
	
	return u, nil
}

/*
func (r *repo) GetUserByFullname(ctx context.Context, fullname string) ([]User, error) {
	result, err := r.Dynamo.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(r.TableName),
		Key: map[string]*dynamodb.AttributeValue{
			"ID": {
				S: aws.String("fullname|" + fullname),
			},
		},
	})
	if err != nil {
		log.Printf("Got error calling GetItem: %s", err)
	}

	u := User{}

	if result.Item == nil {
		return u, ErrNotFound
	}
		
	err = dynamodbattribute.UnmarshalMap(result.Item, &u)
	if err != nil {
		log.Printf("Failed to unmarshal Record, %v", err)
		return u, ErrRepo
	}
	
	return u, nil
}
*/