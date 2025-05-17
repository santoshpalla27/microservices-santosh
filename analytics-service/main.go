package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
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

func main() {
	// Define port
	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
	}

	// Define routes
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/analytics/events", eventsHandler)
	http.HandleFunc("/analytics/stats/user/", userStatsHandler)
	http.HandleFunc("/analytics/stats/system", systemStatsHandler)

	// Start server
	fmt.Printf("Analytics service starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Analytics Service is running",
	})
}

func eventsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Handle POST requests to log events
	if r.Method == "POST" {
		var event Event
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		
		event.CreatedAt = time.Now()
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(event)
		return
	}
	
	// Get user events
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
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(events)
}

func userStatsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// For demo purposes, return dummy stats
	stats := UserStats{
		UserID:         1,
		TasksCreated:   5,
		TasksCompleted: 3,
		TotalTimeSpent: 120,
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stats)
}

func systemStatsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// For demo purposes, return dummy stats
	stats := map[string]interface{}{
		"totalUsers":       100,
		"activeUsers":      42,
		"tasksCreated":     523,
		"tasksCompleted":   327,
		"avgCompletionRate": 62.5,
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stats)
}