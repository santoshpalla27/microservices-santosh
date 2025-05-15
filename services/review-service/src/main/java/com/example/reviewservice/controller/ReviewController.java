package com.example.reviewservice.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.reviewservice.model.Review;
import com.example.reviewservice.repository.ReviewRepository;

@RestController
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;
    
    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;
    
    @GetMapping("/")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("Review Service is running");
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("mongoUri", mongoUri.replaceAll("mongodb://([^:]+):[^@]+@", "mongodb://$1:****@"));
        
        try {
            // Count reviews per product for debugging
            Map<String, Long> reviewCounts = new HashMap<>();
            List<Review> allReviews = reviewRepository.findAll();
            
            for (Review review : allReviews) {
                String productId = review.getProductId();
                reviewCounts.put(productId, 
                        reviewCounts.getOrDefault(productId, 0L) + 1);
            }
            
            response.put("reviewCounts", reviewCounts);
            response.put("totalReviews", allReviews.size());
            response.put("dbStatus", "connected");
        } catch (Exception e) {
            response.put("dbStatus", "error");
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/api/reviews/{productId}")
    public ResponseEntity<?> getReviewsByProductId(@PathVariable String productId) {
        try {
            List<Review> reviews = reviewRepository.findByProductId(productId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve reviews: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/api/reviews/user/{userName}")
    public ResponseEntity<?> getReviewsByUserName(@PathVariable String userName) {
        try {
            List<Review> reviews = reviewRepository.findByUserName(userName);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve reviews: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @PostMapping("/api/reviews")
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        try {
            java.util.UUID uuid = java.util.UUID.randomUUID();
            review.setId(uuid.toString());
            review.setCreatedAt(java.time.LocalDateTime.now());
            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.status(201).body(savedReview);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create review: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}