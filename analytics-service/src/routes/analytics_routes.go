package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/multitech/analytics-service/src/controllers"
)

// SetupRoutes configures all the routes for the analytics service
func SetupRoutes(router *gin.Engine) {
	// Basic health check
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Analytics Service is running",
		})
	})

	// API routes
	api := router.Group("/analytics")
	{
		// Event logging
		api.POST("/events", controllers.LogEvent)
		
		// User events and stats
		api.GET("/events/user/:userId", controllers.GetUserEvents)
		api.GET("/stats/user/:userId", controllers.GetUserStats)
		
		// System-wide statistics
		api.GET("/stats/system", controllers.GetSystemStats)
	}
}