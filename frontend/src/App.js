import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import LoginForm from './components/LoginForm';
import { getTasks, createTask, updateTask, deleteTask, login } from './services/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if we have a token
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchTasks();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
      setIsLoading(false);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setIsLoading(false);
      setErrorMessage('Could not load tasks. Using demo data.');
      // Use some sample data even if the fetch fails
      setTasks([
        {
          id: 1,
          title: 'Complete project documentation',
          description: 'Document the microservices architecture',
          dueDate: '2025-05-30',
          completed: false,
        },
        {
          id: 2,
          title: 'Fix authentication',
          description: 'Resolve JWT token issues in the API gateway',
          dueDate: '2025-05-20',
          completed: true,
        },
      ]);
    }
  };

  const handleLogin = async (credentials) => {
    console.log('Login handler called with:', credentials);
    try {
      // For demo, just accept any login
      // In a real app, you'd verify with the backend
      console.log('Setting demo token');
      localStorage.setItem('token', 'demo-jwt-token');
      setIsAuthenticated(true);
      setErrorMessage('');
      fetchTasks();
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setTasks([]);
  };

  const handleAddTask = async (task) => {
    try {
      // For demo purposes, just add to the local state
      const newTask = {
        id: Date.now(),
        ...task,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setTasks([...tasks, newTask]);
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding task:', error);
      setErrorMessage('Failed to add task. Please try again.');
    }
  };

  const handleUpdateTask = async (id, updatedTask) => {
    try {
      // For demo purposes, just update the local state
      setTasks(tasks.map((task) => 
        task.id === id 
          ? { ...task, ...updatedTask, updatedAt: new Date().toISOString() } 
          : task
      ));
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating task:', error);
      setErrorMessage('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      // For demo purposes, just update the local state
      setTasks(tasks.filter((task) => task.id !== id));
      setErrorMessage('');
    } catch (error) {
      console.error('Error deleting task:', error);
      setErrorMessage('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="App">
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <main className="container">
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        
        {!isAuthenticated ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <>
            <TaskForm onAddTask={handleAddTask} />
            {isLoading ? (
              <p>Loading tasks...</p>
            ) : (
              <TaskList
                tasks={tasks}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;