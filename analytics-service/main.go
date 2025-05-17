package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Event struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"userId"`
	EventType string    `json:"eventType"`
	Resource  string    `json:"resource"`
	Metadata  string    `json:"metadata"`
	CreatedAt time.Time `json:"createdAt"`
}

type UserStats struct {
	UserID         uint   `json:"userId"`
	TasksCreated   uint   `json:"tasksCreated"`
	TasksCompleted uint   `json:"tasksCompleted"`
	TotalTimeSpent uint   `json:"totalTimeSpent"`
}

var db *sql.DB

func main() {
	// Initialize database connection
	initDB()

	// Set up Gin router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.Default())

	// Routes
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Analytics Service is running",
		})
	})

	api := router.Group("/analytics")
	{
		api.POST("/events", logEvent)
		api.GET("/events/user/:userId", getUserEvents)
		api.GET("/stats/user/:userId", getUserStats)
		api.GET("/stats/system", getSystemStats)
	}

	// Define port
	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
	}

	// Start server
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func initDB() {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "root"
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "password"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "multitech_analytics"
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?parseTime=true", 
		dbUser, dbPassword, dbHost, dbName)

	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Test the connection
	err = db.Ping()
	if err != nil {
		log.Printf("Warning: Could not connect to MySQL: %v", err)
	}
}

func logEvent(c *gin.Context) {
	var event Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event.CreatedAt = time.Now()

	// In a real implementation, you would insert the event into the database
	// For demo purposes, we'll just return success
	c.JSON(http.StatusCreated, event)
}

func getUserEvents(c *gin.Context) {
	userID := c.Param("userId")

	// In a real implementation, you would query the database for user events
	// For demo purposes, we'll return dummy data
	events := []Event{
		{
			ID:        1,
			UserID:    1,
			EventType: "task_created",
			Resource:  "task",
			Metadata:  "{}",
			CreatedAt: time.Now(),
		},
	}

	c.JSON(http.StatusOK, events)
}

func getUserStats(c *gin.Context) {
	userID := c.Param("userId")

	// In a real implementation, you would query the database for user stats
	// For demo purposes, we'll return dummy data
	stats := UserStats{
		UserID:         1,
		TasksCreated:   5,
		TasksCompleted: 3,
		TotalTimeSpent: 120,
	}

	c.JSON(http.StatusOK, stats)
}

func getSystemStats(c *gin.Context) {
	// For demo purposes, return some dummy stats
	c.JSON(http.StatusOK, gin.H{
		"totalUsers":       100,
		"activeUsers":      42,
		"tasksCreated":     523,
		"tasksCompleted":   327,
		"avgCompletionRate": 62.5,
	})
}