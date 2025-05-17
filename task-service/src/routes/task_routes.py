from flask import Blueprint, current_app
from src.controllers.task_controller import get_tasks, get_task, create_task, update_task, delete_task
from src.models.task_model import init_db

task_blueprint = Blueprint('tasks', __name__)

# Initialize database
@task_blueprint.before_app_first_request
def before_first_request():
    init_db(current_app)

# Task routes
@task_blueprint.route('/', methods=['GET'])
def list_tasks():
    return get_tasks()

@task_blueprint.route('/<int:task_id>', methods=['GET'])
def get_single_task(task_id):
    return get_task(task_id)

@task_blueprint.route('/', methods=['POST'])
def add_task():
    return create_task()

@task_blueprint.route('/<int:task_id>', methods=['PUT'])
def modify_task(task_id):
    return update_task(task_id)

@task_blueprint.route('/<int:task_id>', methods=['DELETE'])
def remove_task(task_id):
    return delete_task(task_id)