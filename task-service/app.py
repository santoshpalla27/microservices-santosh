from flask import Flask
from flask_cors import CORS
from src.routes.task_routes import task_blueprint

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(task_blueprint, url_prefix='/tasks')

@app.route('/')
def index():
    return {"message": "Task Service is running"}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)