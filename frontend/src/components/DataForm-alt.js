import React, { useState } from 'react';
import api from '../services/api';

const DataForm = () => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [storage, setStorage] = useState('postgres'); // Default to PostgreSQL
  const [status, setStatus] = useState({ message: '', isError: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!key || !value) {
      setStatus({
        message: 'Both key and value are required',
        isError: true
      });
      return;
    }
    
    setIsLoading(true);
    setStatus({ message: '', isError: false });
    
    try {
      if (storage === 'postgres') {
        await api.saveToPostgres(key, value);
        setStatus({
          message: 'Data saved successfully to PostgreSQL',
          isError: false
        });
      } else {
        await api.saveToRedis(key, value);
        setStatus({
          message: 'Data saved successfully to Redis',
          isError: false
        });
      }
      
      // Clear form after successful submission
      setKey('');
      setValue('');
    } catch (error) {
      setStatus({
        message: `Error: ${error.response?.data?.error || error.message}`,
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Add New Data</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="key">Key</label>
          <input
            id="key"
            type="text"
            placeholder="Enter key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="value">Value</label>
          <textarea
            id="value"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>Storage Type</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="storage"
                value="postgres"
                checked={storage === 'postgres'}
                onChange={() => setStorage('postgres')}
              />
              <span>PostgreSQL</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="storage"
                value="redis"
                checked={storage === 'redis'}
                onChange={() => setStorage('redis')}
              />
              <span>Redis</span>
            </label>
          </div>
        </div>
        
        {status.message && (
          <div className={`alert ${status.isError ? 'alert-error' : 'alert-success'}`}>
            {status.message}
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            className={`btn ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Data'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataForm;