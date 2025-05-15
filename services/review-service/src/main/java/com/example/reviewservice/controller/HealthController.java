package com.example.reviewservice.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.reviewservice.model.Review;
import com.example.reviewservice.repository.ReviewRepository;

@RestController
@RequestMapping("/health")
public class HealthController {

    @Autowired
    private ReviewRepository reviewRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        
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
        
        return ResponseEntity.ok(response);
    }
}