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
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-semibold mb-4">Add New Data</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="key">
            Key
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="key"
            type="text"
            placeholder="Enter key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="value">
            Value
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="value"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows="3"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Storage Type
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="storage"
                value="postgres"
                checked={storage === 'postgres'}
                onChange={() => setStorage('postgres')}
              />
              <span className="ml-2">PostgreSQL</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="storage"
                value="redis"
                checked={storage === 'redis'}
                onChange={() => setStorage('redis')}
              />
              <span className="ml-2">Redis</span>
            </label>
          </div>
        </div>
        
        {status.message && (
          <div className={`p-3 mb-4 rounded ${status.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {status.message}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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