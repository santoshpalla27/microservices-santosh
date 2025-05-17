package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/multitech/analytics-service/src/models"
	"net/http"
	"strconv"
	"time"
)

// LogEvent handles recording a new system event
func LogEvent(c *gin.Context) {
	var event models.Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event.CreatedAt = time.Now()
	if err := models.LogEvent(&event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log event"})
		return
	}

	// Update user stats if relevant
	if event.EventType == "task_created" {
		models.UpdateUserStats(event.UserID, true, false, 0)
	} else if event.EventType == "task_completed" {
		models.UpdateUserStats(event.UserID, false, true, 0)
	} else if event.EventType == "time_spent" {
		timeSpent, _ := strconv.ParseUint(event.Metadata, 10, 32)
		models.UpdateUserStats(event.UserID, false, false, uint(timeSpent))
	}

	c.JSON(http.StatusCreated, event)
}

// GetUserEvents handles retrieving events for a user
func GetUserEvents(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	events, err := models.GetUserEvents(uint(userID), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events"})
		return
	}

	c.JSON(http.StatusOK, events)
}

// GetUserStats handles retrieving statistics for a user
func GetUserStats(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	stats, err := models.GetUserStats(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user statistics"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetSystemStats handles retrieving overall system statistics
func GetSystemStats(c *gin.Context) {
	// For this simplified example, return some dummy stats
	// In a real application, this would query and aggregate data
	c.JSON(http.StatusOK, gin.H{
		"totalUsers":      100,
		"activeUsers":     42,
		"tasksCreated":    523,
		"tasksCompleted":  327,
		"avgCompletionRate": 62.5, // percentage
	})
}