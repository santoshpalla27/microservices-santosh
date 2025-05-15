package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Review represents a product review
type Review struct {
	ID        string    `json:"id" bson:"id"`
	ProductID string    `json:"productId" bson:"productId"`
	UserName  string    `json:"userName" bson:"userName"`
	Rating    int       `json:"rating" bson:"rating"`
	Comment   string    `json:"comment" bson:"comment"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
}

var reviewCollection *mongo.Collection
var ctx = context.TODO()

func main() {
	// Set up MongoDB connection
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to MongoDB!")
	reviewCollection = client.Database("products").Collection("reviews")

	// Seed data
	seedReviews()

	// Set up Gin router
	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	router.Use(cors.New(config))

	// Routes
	router.GET("/api/reviews/:productId", getReviewsByProductID)
	router.POST("/api/reviews", createReview)
	router.GET("/api/reviews/user/:userName", getReviewsByUser)
	router.GET("/health", healthCheck)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "6000"
	}
	log.Printf("Review service running on port %s", port)
	router.Run(":" + port)
}

func seedReviews() {
	// Check if we already have reviews
	count, err := reviewCollection.CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("Error counting reviews: %v", err)
		return
	}

	if count > 0 {
		log.Println("Reviews already seeded")
		return
	}

	// Sample product IDs (these should match IDs in the product service)
	// In a real application, you'd fetch these from the product service
	sampleReviews := []Review{
		{
			ID:        uuid.New().String(),
			ProductID: "1", // This would be the actual product ID from product service
			UserName:  "user1",
			Rating:    5,
			Comment:   "Great smartphone, amazing camera!",
			CreatedAt: time.Now(),
		},
		{
			ID:        uuid.New().String(),
			ProductID: "1",
			UserName:  "user2",
			Rating:    4,
			Comment:   "Good phone but battery life could be better",
			CreatedAt: time.Now(),
		},
		{
			ID:        uuid.New().String(),
			ProductID: "2",
			UserName:  "user1",
			Rating:    5,
			Comment:   "Excellent laptop for professional work",
			CreatedAt: time.Now(),
		},
		{
			ID:        uuid.New().String(),
			ProductID: "3",
			UserName:  "user3",
			Rating:    4,
			Comment:   "Great sound quality, comfortable to wear",
			CreatedAt: time.Now(),
		},
	}

	for _, review := range sampleReviews {
		_, err := reviewCollection.InsertOne(ctx, review)
		if err != nil {
			log.Printf("Error inserting review: %v", err)
		}
	}

	log.Println("Reviews seeded successfully!")
}

func getReviewsByProductID(c *gin.Context) {
	productID := c.Param("productId")

	var reviews []Review
	cursor, err := reviewCollection.Find(ctx, bson.M{"productId": productID})
	if err != nil {
		log.Printf("Error finding reviews: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &reviews); err != nil {
		log.Printf("Error parsing reviews: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

func createReview(c *gin.Context) {
	var review Review
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	review.ID = uuid.New().String()
	review.CreatedAt = time.Now()

	_, err := reviewCollection.InsertOne(ctx, review)
	if err != nil {
		log.Printf("Error creating review: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusCreated, review)
}

func getReviewsByUser(c *gin.Context) {
	userName := c.Param("userName")

	var reviews []Review
	cursor, err := reviewCollection.Find(ctx, bson.M{"userName": userName})
	if err != nil {
		log.Printf("Error finding reviews: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &reviews); err != nil {
		log.Printf("Error parsing reviews: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "healthy"})
}