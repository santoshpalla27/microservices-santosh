package models

import (
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/go-sql-driver/mysql"
	"os"
	"time"
)

var DB *gorm.DB

// Event represents a user interaction with the system
type Event struct {
	ID        uint      `json:"id" gorm:"primary_key"`
	UserID    uint      `json:"userId" gorm:"not null"`
	EventType string    `json:"eventType" gorm:"not null"`
	Resource  string    `json:"resource"`
	ResourceID uint     `json:"resourceId"`
	Metadata  string    `json:"metadata" gorm:"type:text"`
	CreatedAt time.Time `json:"createdAt" gorm:"default:CURRENT_TIMESTAMP"`
}

// UserStats represents aggregated statistics for a user
type UserStats struct {
	ID                uint      `json:"id" gorm:"primary_key"`
	UserID            uint      `json:"userId" gorm:"not null;unique"`
	TasksCreated      uint      `json:"tasksCreated" gorm:"default:0"`
	TasksCompleted    uint      `json:"tasksCompleted" gorm:"default:0"`
	LastActive        time.Time `json:"lastActive"`
	TotalTimeSpent    uint      `json:"totalTimeSpent" gorm:"default:0"` // in minutes
	UpdatedAt         time.Time `json:"updatedAt" gorm:"default:CURRENT_TIMESTAMP"`
}

// InitDB initializes the database connection
func InitDB() error {
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

	dbURI := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbName)

	var err error
	DB, err = gorm.Open("mysql", dbURI)
	if err != nil {
		return err
	}

	// Auto migrate models
	DB.AutoMigrate(&Event{}, &UserStats{})

	return nil
}

// LogEvent records a new event in the system
func LogEvent(event *Event) error {
	return DB.Create(event).Error
}

// GetUserEvents retrieves events for a specific user
func GetUserEvents(userID uint, limit int, offset int) ([]Event, error) {
	var events []Event
	err := DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&events).Error
	return events, err
}

// GetUserStats retrieves statistics for a specific user
func GetUserStats(userID uint) (*UserStats, error) {
	var stats UserStats
	err := DB.Where("user_id = ?", userID).First(&stats).Error
	if err == gorm.ErrRecordNotFound {
		// Create new stats if none exist
		stats = UserStats{
			UserID:     userID,
			LastActive: time.Now(),
		}
		err = DB.Create(&stats).Error
	}
	return &stats, err
}

// UpdateUserStats updates user statistics based on activity
func UpdateUserStats(userID uint, taskCreated bool, taskCompleted bool, timeSpent uint) error {
	stats, err := GetUserStats(userID)
	if err != nil {
		return err
	}

	if taskCreated {
		stats.TasksCreated++
	}

	if taskCompleted {
		stats.TasksCompleted++
	}

	stats.LastActive = time.Now()
	stats.TotalTimeSpent += timeSpent
	stats.UpdatedAt = time.Now()

	return DB.Save(stats).Error
}