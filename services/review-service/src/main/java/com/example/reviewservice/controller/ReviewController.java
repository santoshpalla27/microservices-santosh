package com.example.reviewservice.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.reviewservice.model.Review;
import com.example.reviewservice.repository.ReviewRepository;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;
    
    @GetMapping("/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProductId(@PathVariable String productId) {
        return ResponseEntity.ok(reviewRepository.findByProductId(productId));
    }
    
    @GetMapping("/user/{userName}")
    public ResponseEntity<List<Review>> getReviewsByUserName(@PathVariable String userName) {
        return ResponseEntity.ok(reviewRepository.findByUserName(userName));
    }
    
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        review.setId(UUID.randomUUID().toString());
        review.setCreatedAt(LocalDateTime.now());
        Review savedReview = reviewRepository.save(review);
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Healthy");
    }
}