import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PostgresData = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getAllFromPostgres();
      setData(response);
    } catch (err) {
      setError('Failed to fetch PostgreSQL data. Please try again later.');
      console.error('Error fetching PostgreSQL data:', err);
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
        <h2 className="card-title">PostgreSQL Data</h2>
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
        <div className="text-center p-4">No data found in PostgreSQL</div>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Key</th>
                <th>Value</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.key}</td>
                  <td>{item.value}</td>
                  <td>
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PostgresData;