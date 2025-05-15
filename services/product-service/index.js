const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/products';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Seed data
const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    const products = [
      {
        id: uuidv4(),
        name: 'Smartphone X',
        description: 'Latest flagship smartphone with amazing camera',
        price: 999.99,
        image: 'https://via.placeholder.com/300x200?text=Smartphone+X',
        category: 'Electronics'
      },
      {
        id: uuidv4(),
        name: 'Laptop Pro',
        description: 'Powerful laptop for professionals',
        price: 1499.99,
        image: 'https://via.placeholder.com/300x200?text=Laptop+Pro',
        category: 'Electronics'
      },
      {
        id: uuidv4(),
        name: 'Wireless Headphones',
        description: 'Noise cancelling wireless headphones',
        price: 249.99,
        image: 'https://via.placeholder.com/300x200?text=Wireless+Headphones',
        category: 'Audio'
      },
      {
        id: uuidv4(),
        name: 'Smart Watch',
        description: 'Track your fitness and stay connected',
        price: 299.99,
        image: 'https://via.placeholder.com/300x200?text=Smart+Watch',
        category: 'Wearables'
      },
      {
        id: uuidv4(),
        name: 'Bluetooth Speaker',
        description: 'Portable speaker with amazing sound',
        price: 129.99,
        image: 'https://via.placeholder.com/300x200?text=Bluetooth+Speaker',
        category: 'Audio'
      },
      {
        id: uuidv4(),
        name: 'Tablet Ultra',
        description: 'Thin and light tablet with stunning display',
        price: 549.99,
        image: 'https://via.placeholder.com/300x200?text=Tablet+Ultra',
        category: 'Electronics'
      }
    ];

    await Product.insertMany(products);
    console.log('Database seeded with sample products');
  }
};

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().select('-__v');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id }).select('-__v');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      id: uuidv4()
    });
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server and seed data
app.listen(PORT, async () => {
  console.log(`Product service running on port ${PORT}`);
  await seedProducts();
});