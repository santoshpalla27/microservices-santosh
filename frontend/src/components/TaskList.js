import React from 'react';

function TaskList({ tasks, onUpdateTask, onDeleteTask }) {
  if (tasks.length === 0) {
    return <p>No tasks yet. Add a new task to get started!</p>;
  }

  return (
    <div className="task-list">
      <h2>Your Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <div className="task-info">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <span className="due-date">Due: {task.dueDate}</span>
            </div>
            <div className="task-actions">
              <button
                onClick={() =>
                  onUpdateTask(task.id, { ...task, completed: !task.completed })
                }
              >
                {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <button onClick={() => onDeleteTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;