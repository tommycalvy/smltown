package post

import (
	"context"
	"flag"
	"log"

	pb "github.com/tommycalvy/smltown/crud_service/protos"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)


var (
	serverAddr         = flag.String("addr", "localhost:50051", "The server address in the format of host:port")
)


type filterRepo struct {
	client 			pb.FilterServiceClient
	Conn 			*grpc.ClientConn
}

func NewFilterServiceRepo() FilterServiceRepository {
	conn, err := grpc.Dial(*serverAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("fail to dial: %v", err)
	}
	client := pb.NewFilterServiceClient(conn)
	return &filterRepo{
		client: client,
		Conn: conn,
	}
}

func (r *filterRepo) CloseConn() {
	r.Conn.Close()
}

func (r *filterRepo) AddPost(ctx context.Context, p Post) error {
	post := pb.Post {
		Username: p.Username,
		Timestamp: p.Timestamp,
		Latitude: p.Latitude,
		Longitude: p.Longitude,
		Channel1: p.Channel1,
		Channel2: p.Channel2,
		Votes: p.Votes,
	}
	_, err := r.client.AddPost(ctx, &post)
	if err != nil {
		return err
	}
	return nil
}

func (r *filterRepo) GetHotPostsNearMe(ctx context.Context, f Filter) ([]PostID, error) {
	filters := pb.Filters {
		Timestamp: f.Timestamp,
		Latitude: f.Latitude,
		Longitude: f.Longitude,
		Channel1: f.Channel1,
		Channel2: f.Channel2,
		Range: f.Georange,
	}
	pbPostIDs, err := r.client.GetHotPostsNearMe(ctx, &filters)
	if err != nil {
		return nil, err
	}
	postIDs := make([]PostID, len(pbPostIDs.Id))
	for i, postID := range pbPostIDs.Id {
		postIDs[i] = PostID {
			Username: postID.Username,
			Timestamp: postID.Timestamp,
		}
	}
	return postIDs, nil
}