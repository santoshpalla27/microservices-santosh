import React from 'react';

const ProductList = ({ products }) => {
  if (products.length === 0) {
    return <div className="no-products">No products found</div>;
  }

  // Function to safely render SVG content
  const renderSVG = (svgContent) => {
    if (!svgContent) {
      // Default SVG if none provided
      return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#f0f0f0" />
          <text x="50" y="50" fontFamily="Arial" fontSize="10" textAnchor="middle">No Image</text>
        </svg>
      );
    }
    
    return (
      <div dangerouslySetInnerHTML={{ __html: svgContent }} className="product-svg" />
    );
  };

  return (
    <div className="products">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <div className="product-image-container">
            {product.image && product.image.includes('<svg') 
              ? renderSVG(product.image)
              : <img 
                  src={product.image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`} 
                  alt={product.name} 
                  className="product-image" 
                />
            }
          </div>
          <div className="product-info">
            <h3 className="product-title">{product.name}</h3>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p className="product-description">{product.description}</p>
            <div className="reviews">
              <p>{product.reviews ? `${product.reviews.length} reviews` : 'No reviews yet'}</p>
              {product.reviews && product.reviews.length > 0 && (
                <p>Average Rating: {(product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)}/5</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;