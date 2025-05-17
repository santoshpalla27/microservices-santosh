import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const MySQLUsers = ({ refreshTrigger, onDelete }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch users from MySQL database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getMySQLUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching MySQL users:', err);
      setError('Failed to fetch users from MySQL database');
      toast.error('Failed to load MySQL users');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a user
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await api.deleteMySQLUser(id);
      toast.success('User deleted successfully');
      
      // Trigger refresh in parent component
      if (onDelete) onDelete();
      
      // Or refresh locally
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };
  
  // Fetch users on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);
  
  // Refresh button handler
  const handleRefresh = () => {
    fetchUsers();
  };
  
  if (loading) {
    return <div className="loading">Loading MySQL users...</div>;
  }
  
  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button className="refresh-btn" onClick={handleRefresh}>Retry</button>
      </div>
    );
  }
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>MySQL Database Users</h2>
        <button className="refresh-btn" onClick={handleRefresh}>Refresh</button>
      </div>
      
      {users.length === 0 ? (
        <p className="empty-message">No users found in MySQL database</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>{new Date(user.created_at).toLocaleString()}</td>
                <td>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MySQLUsers;