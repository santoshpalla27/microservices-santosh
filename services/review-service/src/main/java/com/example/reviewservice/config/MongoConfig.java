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
                        "1",  // This would match product IDs from product service
                        "user1",
                        5,
                        "Great smartphone, amazing camera!",
                        LocalDateTime.now()
                    ),
                    new Review(
                        UUID.randomUUID().toString(),
                        "1",
                        "user2",
                        4,
                        "Good phone but battery life could be better",
                        LocalDateTime.now()
                    ),
                    new Review(
                        UUID.randomUUID().toString(),
                        "2",
                        "user1",
                        5,
                        "Excellent laptop for professional work",
                        LocalDateTime.now()
                    ),
                    new Review(
                        UUID.randomUUID().toString(),
                        "3",
                        "user3",
                        4,
                        "Great sound quality, comfortable to wear",
                        LocalDateTime.now()
                    )
                );
                
                repository.saveAll(reviews);
                System.out.println("Database seeded with sample reviews");
            }
        };
    }
}