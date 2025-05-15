import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProductList from './components/ProductList';
import SearchBar from './components/SearchBar';

function App() {
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const productApiUrl = process.env.REACT_APP_PRODUCT_API_URL || 'http://localhost:4000';
  const searchApiUrl = process.env.REACT_APP_SEARCH_API_URL || 'http://localhost:5000';
  const reviewApiUrl = process.env.REACT_APP_REVIEW_API_URL || 'http://localhost:6000';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${productApiUrl}/api/products`);
      
      // Fetch reviews for each product
      const productsWithReviews = await Promise.all(
        response.data.map(async (product) => {
          try {
            const reviewsResponse = await axios.get(`${reviewApiUrl}/api/reviews/${product.id}`);
            return { ...product, reviews: reviewsResponse.data };
          } catch (err) {
            console.error(`Error fetching reviews for product ${product.id}:`, err);
            return { ...product, reviews: [] };
          }
        })
      );
      
      setProducts(productsWithReviews);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
      setLoading(false);
      console.error('Error fetching products:', err);
    }
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const response = await axios.get(`${searchApiUrl}/api/search?q=${encodeURIComponent(searchTerm)}`);
      
      // Fetch reviews for each search result
      const resultsWithReviews = await Promise.all(
        response.data.map(async (product) => {
          try {
            const reviewsResponse = await axios.get(`${reviewApiUrl}/api/reviews/${product.id}`);
            return { ...product, reviews: reviewsResponse.data };
          } catch (err) {
            console.error(`Error fetching reviews for product ${product.id}:`, err);
            return { ...product, reviews: [] };
          }
        })
      );
      
      setSearchResults(resultsWithReviews);
      setLoading(false);
    } catch (err) {
      setError('Failed to search products. Please try again later.');
      setLoading(false);
      console.error('Error searching products:', err);
    }
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container header-content">
          <h1>ProductMicro</h1>
        </div>
      </header>
      
      <main className="container">
        <SearchBar onSearch={handleSearch} onClear={clearSearch} />
        
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <ProductList products={isSearching ? searchResults : products} />
        )}
      </main>
    </div>
  );
}

export default App;