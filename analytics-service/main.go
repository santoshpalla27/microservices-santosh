package main

import (
	"github.com/multitech/analytics-service/src/controllers"
	"github.com/multitech/analytics-service/src/models"
	"github.com/multitech/analytics-service/src/routes"
	
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"os"
)

func main() {
	// Initialize database
	if err := models.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Set up Gin router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.Default())

	// Register routes
	routes.SetupRoutes(router)

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