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

// Sample product data for seeding
const products = [
  {
    id: "1", // Using string IDs that will match with review service
    name: 'Smartphone X',
    description: 'Latest flagship smartphone with amazing camera',
    price: 999.99,
    image: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="10" width="60" height="80" rx="5" fill="#333"/><rect x="30" y="20" width="40" height="50" rx="2" fill="#6eb5ff"/><circle cx="50" cy="80" r="5" fill="#ddd"/></svg>',
    category: 'Electronics'
  },
  {
    id: "2",
    name: 'Laptop Pro',
    description: 'Powerful laptop for professionals',
    price: 1499.99,
    image: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="80" height="50" rx="3" fill="#555"/><rect x="15" y="25" width="70" height="40" fill="#88c1ff"/><rect x="5" y="70" width="90" height="10" rx="2" fill="#555"/></svg>',
    category: 'Electronics'
  },
  {
    id: "3",
    name: 'Wireless Headphones',
    description: 'Noise cancelling wireless headphones',
    price: 249.99,
    image: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="50" r="20" fill="#444"/><circle cx="75" cy="50" r="20" fill="#444"/><path d="M25 30 A 25 25 0 0 1 75 30" stroke="#444" stroke-width="8" fill="none"/></svg>',
    category: 'Audio'
  },
  {
    id: "4",
    name: 'Smart Watch',
    description: 'Track your fitness and stay connected',
    price: 299.99,
    image: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="40" height="60" rx="10" fill="#66a3ff"/><rect x="35" y="25" width="30" height="50" fill="#cce0ff"/><path d="M30 40 L 25 45 L 25 55 L 30 60" stroke="#444" stroke-width="3" fill="none"/><path d="M70 40 L 75 45 L 75 55 L 70 60" stroke="#444" stroke-width="3" fill="none"/></svg>',
    category: 'Wearables'
  },
  {
    id: "5",
    name: 'Bluetooth Speaker',
    description: 'Portable speaker with amazing sound',
    price: 129.99,
    image: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="60" height="60" rx="5" fill="#6c7ae0"/><circle cx="50" cy="50" r="15" fill="#444"/><circle cx="50" cy="50" r="10" fill="#666"/><circle cx="50" cy="50" r="5" fill="#888"/></svg>',
    category: 'Audio'
  },
  {
    id: "6",
    name: 'Tablet Ultra',
    description: 'Thin and light tablet with stunning display',
    price: 549.99,
    image: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="10" width="70" height="80" rx="5" fill="#777"/><rect x="20" y="15" width="60" height="70" fill="#a3c9ff"/><circle cx="50" cy="90" r="3" fill="#ddd"/></svg>',
    category: 'Electronics'
  }
];

// Seed data function
const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
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