from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
import os
import re

app = Flask(__name__)
CORS(app)

# MongoDB Connection
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/products')
mongo_client = pymongo.MongoClient(MONGO_URI)
db = mongo_client.get_database()
products_collection = db.products

@app.route('/api/search', methods=['GET'])
def search_products():
    query = request.args.get('q', '')
    
    if not query:
        return jsonify([])
    
    # Create a regex pattern for case-insensitive search
    pattern = re.compile(f".*{re.escape(query)}.*", re.IGNORECASE)
    
    # Search in name, description, and category fields
    results = products_collection.find({
        "$or": [
            {"name": {"$regex": pattern}},
            {"description": {"$regex": pattern}},
            {"category": {"$regex": pattern}}
        ]
    })
    
    # Convert MongoDB documents to JSON serializable format
    products = []
    for product in results:
        # Remove MongoDB _id field which is not JSON serializable
        product['_id'] = str(product['_id'])
        products.append(product)
    
    return jsonify(products)

@app.route('/api/search/category/<category>', methods=['GET'])
def search_by_category(category):
    if not category:
        return jsonify([])
    
    pattern = re.compile(f"^{re.escape(category)}$", re.IGNORECASE)
    results = products_collection.find({"category": {"$regex": pattern}})
    
    products = []
    for product in results:
        product['_id'] = str(product['_id'])
        products.append(product)
    
    return jsonify(products)

@app.route('/api/search/price', methods=['GET'])
def search_by_price_range():
    min_price = float(request.args.get('min', 0))
    max_price = float(request.args.get('max', float('inf')))
    
    results = products_collection.find({
        "price": {"$gte": min_price, "$lte": max_price}
    })
    
    products = []
    for product in results:
        product['_id'] = str(product['_id'])
        products.append(product)
    
    return jsonify(products)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)