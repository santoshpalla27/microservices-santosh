package com.example.reviewservice.config;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.example.reviewservice.model.Review;
import com.example.reviewservice.repository.ReviewRepository;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

@Configuration
@EnableMongoRepositories(basePackages = "com.example.reviewservice.repository")
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;
    
    @Override
    protected String getDatabaseName() {
        return "products";
    }
    
    @Override
    public MongoClient mongoClient() {
        System.out.println("Connecting to MongoDB with URI: " + mongoUri);
        ConnectionString connectionString = new ConnectionString(mongoUri);
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();
        return MongoClients.create(mongoClientSettings);
    }

    @Bean
    public CommandLineRunner seedDatabase(ReviewRepository repository) {
        return args -> {
            System.out.println("Checking if reviews need to be seeded...");
            try {
                long count = repository.count();
                System.out.println("Current review count: " + count);
                
                if (count == 0) {
                    System.out.println("Seeding reviews...");
                    
                    List<Review> reviews = new ArrayList<>();
                    reviews.add(new Review(
                        UUID.randomUUID().toString(),
                        "1",  // Matches product ID from product service
                        "user1",
                        5,
                        "Great smartphone, amazing camera!",
                        LocalDateTime.now()
                    ));
                    reviews.add(new Review(
                        UUID.randomUUID().toString(),
                        "1",  // Multiple reviews for the first product
                        "user2",
                        4,
                        "Good phone but battery life could be better",
                        LocalDateTime.now()
                    ));
                    reviews.add(new Review(
                        UUID.randomUUID().toString(),
                        "2",  // Matches product ID from product service
                        "user1",
                        5,
                        "Excellent laptop for professional work",
                        LocalDateTime.now()
                    ));
                    reviews.add(new Review(
                        UUID.randomUUID().toString(),
                        "3",  // Matches product ID from product service
                        "user3",
                        4,
                        "Great sound quality, comfortable to wear",
                        LocalDateTime.now()
                    ));
                    reviews.add(new Review(
                        UUID.randomUUID().toString(),
                        "4",  // Smart Watch
                        "user4",
                        5,
                        "Perfect fitness companion, love the features!",
                        LocalDateTime.now()
                    ));
                    reviews.add(new Review(
                        UUID.randomUUID().toString(),
                        "5",  // Bluetooth Speaker
                        "user2",
                        4,
                        "Good sound quality for the size, battery lasts all day",
                        LocalDateTime.now()
                    ));
                    reviews.add(new Review(
                        UUID.randomUUID().toString(),
                        "6",  // Tablet Ultra
                        "user3",
                        5,
                        "Great display, perfect for watching movies and browsing",
                        LocalDateTime.now()
                    ));
                    
                    repository.saveAll(reviews);
                    System.out.println("Database seeded with " + reviews.size() + " sample reviews");
                } else {
                    System.out.println("Database already has reviews, skipping seeding");
                }
            } catch (Exception e) {
                System.err.println("Error seeding database: " + e.getMessage());
                e.printStackTrace();
                // Continue application startup even if seeding fails
            }
        };
    }
}