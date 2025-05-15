package com.example.reviewservice.config;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.example.reviewservice.model.Review;
import com.example.reviewservice.repository.ReviewRepository;

@Configuration
@EnableMongoRepositories(basePackages = "com.example.reviewservice.repository")
public class MongoConfig {

    @Bean
    public CommandLineRunner seedDatabase(@Autowired ReviewRepository repository) {
        return args -> {
            // Check if we already have reviews
            if (repository.count() == 0) {
                // Add some sample data
                List<Review> reviews = List.of(
                    new Review(
                        UUID.randomUUID().toString(),
                        "1",  // Matches product ID from product service
                        "user1",
                        5,
                        "Great smartphone, amazing camera!",
                        LocalDateTime.now()
                    ),
                    new Review(
                        UUID.randomUUID().toString(),
                        "1",  // Multiple reviews for the first product
                        "user2",
                        4,
                        "Good phone but battery life could be better",
                        LocalDateTime.now()
                    ),
                    new Review(
                        UUID.randomUUID().toString(),
                        "2",  // Matches product ID from product service
                        "user1",
                        5,
                        "Excellent laptop for professional work",
                        LocalDateTime.now()
                    ),
                    new Review(
                        UUID.randomUUID().toString(),
                        "3",  // Matches product ID from product service
                        "user3",
                        4,
                        "Great sound quality, comfortable to wear",
                        LocalDateTime.now()
                    ),
                    new Review(
                        UUID.randomUUID().toString(),
                        "4",  // Smart Watch
                        "user4",
                        5,
                        "Perfect fitness companion, love the features!",
                        LocalDateTime.now()
                    ),
                    new Review(
                        UUID.randomUUID().toString(),
                        "5",  // Bluetooth Speaker
                        "user2",
                        4,
                        "Good sound quality for the size, battery lasts all day",
                        LocalDateTime.now()
                    ),
                    new Review(
                        UUID.randomUUID().toString(),
                        "6",  // Tablet Ultra
                        "user3",
                        5,
                        "Great display, perfect for watching movies and browsing",
                        LocalDateTime.now()
                    )
                );
                
                repository.saveAll(reviews);
                System.out.println("Database seeded with sample reviews");
            }
        };
    }
}