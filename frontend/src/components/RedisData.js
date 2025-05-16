import React, { useState, useEffect } from 'react';
import api from '../services/api';

const RedisData = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getAllFromRedis();
      setData(response);
    } catch (err) {
      setError('Failed to fetch Redis data. Please try again later.');
      console.error('Error fetching Redis data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="card-title">Redis Data</h2>
        <button 
          onClick={fetchData}
          className={`btn ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center p-4">Loading data...</div>
      ) : data.length === 0 ? (
        <div className="text-center p-4">No data found in Redis</div>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.key}</td>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RedisData;