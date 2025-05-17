import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const UserForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    storage: 'mysql' // Default storage option
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleStorageChange = (e) => {
    setFormData({
      ...formData,
      storage: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required!');
      return;
    }
    
    try {
      setLoading(true);
      await api.createUser(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        storage: formData.storage // Keep the selected storage option
      });
      
      toast.success(`User successfully added to ${formData.storage}!`);
      
      // Trigger refresh in parent component
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="user-form">
      <h2 className="form-title">Add New User</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>
        
        <div className="form-group">
          <label>Storage Option</label>
          <div className="storage-options">
            <div className="storage-option">
              <input
                type="radio"
                id="mysql"
                name="storage"
                value="mysql"
                checked={formData.storage === 'mysql'}
                onChange={handleStorageChange}
              />
              <label htmlFor="mysql">MySQL Database</label>
            </div>
            
            <div className="storage-option">
              <input
                type="radio"
                id="redis"
                name="storage"
                value="redis"
                checked={formData.storage === 'redis'}
                onChange={handleStorageChange}
              />
              <label htmlFor="redis">Redis Cluster</label>
            </div>
          </div>
        </div>
        
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add User'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;