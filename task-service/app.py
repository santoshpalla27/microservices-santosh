from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory task store for demo purposes
tasks = [
    {
        "id": 1,
        "title": "Complete project documentation",
        "description": "Write comprehensive documentation for the MultiTech Task Manager project",
        "dueDate": "2025-05-30",
        "completed": False,
        "userId": 1,
        "createdAt": "2025-05-17T08:00:00",
        "updatedAt": "2025-05-17T08:00:00"
    },
    {
        "id": 2,
        "title": "Setup CI/CD pipeline",
        "description": "Implement continuous integration and deployment for the project",
        "dueDate": "2025-05-25",
        "completed": False,
        "userId": 1,
        "createdAt": "2025-05-17T09:15:00",
        "updatedAt": "2025-05-17T09:15:00"
    }
]

next_id = 3

@app.route('/')
def index():
    return jsonify({"message": "Task Service is running"})

@app.route('/tasks', methods=['GET'])
def get_tasks():
    user_id = request.args.get('userId', 1, type=int)
    user_tasks = [task for task in tasks if task['userId'] == user_id]
    return jsonify(user_tasks)

@app.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = next((task for task in tasks if task['id'] == task_id), None)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    return jsonify(task)

@app.route('/tasks', methods=['POST'])
def create_task():
    global next_id
    data = request.json
    
    now = datetime.now().isoformat()
    new_task = {
        "id": next_id,
        "title": data.get('title', ''),
        "description": data.get('description', ''),
        "dueDate": data.get('dueDate'),
        "completed": data.get('completed', False),
        "userId": data.get('userId', 1),
        "createdAt": now,
        "updatedAt": now
    }
    
    tasks.append(new_task)
    next_id += 1
    
    return jsonify(new_task), 201

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = next((task for task in tasks if task['id'] == task_id), None)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    
    data = request.json
    task['title'] = data.get('title', task['title'])
    task['description'] = data.get('description', task['description'])
    task['dueDate'] = data.get('dueDate', task['dueDate'])
    task['completed'] = data.get('completed', task['completed'])
    task['updatedAt'] = datetime.now().isoformat()
    
    return jsonify(task)

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    global tasks
    task = next((task for task in tasks if task['id'] == task_id), None)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    
    tasks = [task for task in tasks if task['id'] != task_id]
    return jsonify({"message": "Task deleted"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))