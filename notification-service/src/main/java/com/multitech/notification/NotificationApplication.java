package com.multitech.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class NotificationApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationApplication.class, args);
    }
    
    // Fallback controller that will work even if database connection fails
    @RestController
    public static class FallbackController {
        @GetMapping("/")
        public Map<String, String> home() {
            return Map.of("message", "Notification Service is running");
        }
        
        @GetMapping("/health")
        public Map<String, String> health() {
            return Map.of("status", "UP");
        }
    }
}