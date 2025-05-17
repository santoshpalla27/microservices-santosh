import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const RedisUsers = ({ refreshTrigger, onDelete }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Fetch users from Redis
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRedisUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching Redis users:', err);
      setError(err.response?.data || { 
        message: 'Failed to fetch users from Redis cluster',
        suggestion: 'The Redis Cluster may still be initializing. Please wait a moment and try again.'
      });
      toast.error('Failed to load Redis users. The cluster may still be initializing.');
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
      await api.deleteRedisUser(id);
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
  }, [refreshTrigger, retryCount]);
  
  // Refresh button handler
  const handleRefresh = () => {
    fetchUsers();
  };
  
  // Retry button handler
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };
  
  if (loading) {
    return <div className="loading">Loading Redis users...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Redis Users</h3>
        <p>{error.message}</p>
        {error.suggestion && <p><strong>Suggestion:</strong> {error.suggestion}</p>}
        <div className="button-group">
          <button className="refresh-btn" onClick={handleRetry}>Retry</button>
          <button className="tab-btn" onClick={() => document.querySelector('.tab-btn').click()}>
            Switch to MySQL View
          </button>
        </div>
      </div>
    );
  }
  
  // Extract ID from the Redis key format (user:12345)
  const extractId = (redisId) => {
    if (!redisId) return '';
    return redisId.split(':')[1] || redisId;
  };
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Redis Cluster Users</h2>
        <button className="refresh-btn" onClick={handleRefresh}>Refresh</button>
      </div>
      
      {users.length === 0 ? (
        <p className="empty-message">No users found in Redis cluster</p>
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
                <td>{extractId(user.id)}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</td>
                <td>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(extractId(user.id))}
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

export default RedisUsers;