from flask import request, jsonify
from src.models.task_model import db, Task
from datetime import datetime

def get_tasks():
    # Extract user ID from JWT token
    # For demo, we're using a query param instead
    user_id = request.args.get('userId', 1)
    
    tasks = Task.query.filter_by(user_id=user_id).all()
    return jsonify([task.to_dict() for task in tasks])

def get_task(task_id):
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
        
    return jsonify(task.to_dict())

def create_task():
    data = request.json
    
    # Extract user ID from JWT token
    # For demo, we're assuming it's in the request body
    user_id = data.get('userId', 1)
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        due_date=datetime.fromisoformat(data['dueDate']) if data.get('dueDate') else None,
        completed=data.get('completed', False),
        user_id=user_id
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

def update_task(task_id):
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
        
    data = request.json
    
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.due_date = datetime.fromisoformat(data['dueDate']) if data.get('dueDate') else task.due_date
    task.completed = data.get('completed', task.completed)
    
    db.session.commit()
    
    return jsonify(task.to_dict())

def delete_task(task_id):
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
        
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted'})