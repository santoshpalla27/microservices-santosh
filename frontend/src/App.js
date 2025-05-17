import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import LoginForm from './components/LoginForm'; // New component
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
      setErrorMessage('Could not load tasks. Please try again later.');
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const userData = await login(credentials);
      localStorage.setItem('token', userData.token);
      setIsAuthenticated(true);
      fetchTasks();
      setErrorMessage('');
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
      const newTask = await createTask(task);
      setTasks([...tasks, newTask]);
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding task:', error);
      setErrorMessage('Failed to add task. Please try again.');
    }
  };

  const handleUpdateTask = async (id, updatedTask) => {
    try {
      const task = await updateTask(id, updatedTask);
      setTasks(tasks.map((t) => (t.id === id ? task : t)));
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating task:', error);
      setErrorMessage('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
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