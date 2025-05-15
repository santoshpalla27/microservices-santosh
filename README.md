ProductMicro - Microservices Demo
This project demonstrates a simple microservices architecture using React for the frontend and multiple backend languages for different services. The application is a product catalog with search and review functionality.
Architecture

Frontend: React application
Product Service: Node.js/Express API
Search Service: Python/Flask API
Review Service: Go/Gin API
Database: MongoDB (shared between services)

Technologies Used

Frontend: React, Axios
Product Service: Node.js, Express, Mongoose
Search Service: Python, Flask, PyMongo
Review Service: Go, Gin, MongoDB Go Driver
Infrastructure: Docker, Docker Compose

Services Overview

Frontend (React)

Displays products with their details and reviews
Allows searching for products
Port: 3000


Product Service (Node.js)

Manages product data (CRUD operations)
Port: 4000
Endpoints:

GET /api/products - List all products
GET /api/products/:id - Get a specific product
POST /api/products - Create a new product
PUT /api/products/:id - Update a product
DELETE /api/products/:id - Delete a product




Search Service (Python)

Handles product search functionality
Port: 5000
Endpoints:

GET /api/search?q=:query - Search products by name, description, or category
GET /api/search/category/:category - Get products by category
GET /api/search/price?min=:min&max=:max - Get products in a price range




Review Service (Go)

Manages product reviews
Port: 6000
Endpoints:

GET /api/reviews/:productId - Get reviews for a product
POST /api/reviews - Create a new review
GET /api/reviews/user/:userName - Get reviews by a specific user





Running the Application
Prerequisites

Docker and Docker Compose installed on your machine

Steps to Run

Clone the repository
Navigate to the project root directory
Start all services with Docker Compose:

bashdocker-compose up

Access the application in your browser:

Frontend: http://localhost:3000
Product API: http://localhost:4000/api/products
Search API: http://localhost:5000/api/search?q=laptop
Review API: http://localhost:6000/api/reviews/1



Development
If you want to run each service separately for development:
Frontend:
bashcd frontend
npm install
npm start
Product Service:
bashcd services/product-service
npm install
npm start
Search Service:
bashcd services/search-service
pip install -r requirements.txt
python app.py
Review Service:
bashcd services/review-service
go run main.go
Project Structure
project-root/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       └── components/
│           ├── ProductList.js
│           └── SearchBar.js
├── services/
│   ├── product-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── index.js
│   ├── search-service/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app.py
│   └── review-service/
│       ├── Dockerfile
│       ├── go.mod
│       └── main.go
└── README.md
Additional Notes

The application uses a shared MongoDB instance for data storage
Sample data is automatically seeded when the services start
In a production environment, you would want to add authentication, better error handling, and more robust data validation
