const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 6000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/products';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Review Schema
const reviewSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  productId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// Seed data
const seedReviews = async () => {
  const count = await Review.countDocuments();
  if (count === 0) {
    const reviews = [
      {
        id: uuidv4(),
        productId: "1", // This would be the actual product ID from product service
        userName: "user1",
        rating: 5,
        comment: "Great smartphone, amazing camera!",
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        productId: "1",
        userName: "user2",
        rating: 4,
        comment: "Good phone but battery life could be better",
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        productId: "2",
        userName: "user1",
        rating: 5,
        comment: "Excellent laptop for professional work",
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        productId: "3",
        userName: "user3",
        rating: 4,
        comment: "Great sound quality, comfortable to wear",
        createdAt: new Date()
      }
    ];

    try {
      await Review.insertMany(reviews);
      console.log('Database seeded with sample reviews');
    } catch (err) {
      console.error('Error seeding reviews:', err);
    }
  }
};

// Routes
app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).select('-__v');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = new Review({
      ...req.body,
      id: uuidv4()
    });
    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/reviews/user/:userName', async (req, res) => {
  try {
    const reviews = await Review.find({ userName: req.params.userName }).select('-__v');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server and seed data
app.listen(PORT, async () => {
  console.log(`Review service running on port ${PORT}`);
  await seedReviews();
});