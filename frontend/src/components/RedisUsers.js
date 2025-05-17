import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const RedisUsers = ({ refreshTrigger, onDelete }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch users from Redis
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getRedisUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching Redis users:', err);
      setError('Failed to fetch users from Redis cluster');
      toast.error('Failed to load Redis users');
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
  }, [refreshTrigger]);
  
  // Refresh button handler
  const handleRefresh = () => {
    fetchUsers();
  };
  
  if (loading) {
    return <div className="loading">Loading Redis users...</div>;
  }
  
  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button className="refresh-btn" onClick={handleRefresh}>Retry</button>
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