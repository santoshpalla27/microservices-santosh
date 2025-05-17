import React, { useState, useEffect } from 'react';

const DatabaseStatus = () => {
  const [status, setStatus] = useState({
    postgres: 'checking',
    redis: 'checking',
    overall: 'checking'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/health');
      
      if (response.ok) {
        const data = await response.json();
        
        setStatus({
          postgres: data.postgres || 'DOWN',
          redis: data.redis || 'DOWN',
          overall: data.status || 'DOWN'
        });
      } else {
        setStatus({
          postgres: 'DOWN',
          redis: 'DOWN',
          overall: 'DOWN'
        });
        
        setError('Could not fetch service status');
      }
    } catch (err) {
      console.error('Error checking database status:', err);
      
      setStatus({
        postgres: 'DOWN',
        redis: 'DOWN',
        overall: 'DOWN'
      });
      
      setError('Could not connect to backend services');
    } finally {
      setIsLoading(false);
    }
  };

  // Check status on component mount and every 10 seconds
  useEffect(() => {
    checkStatus();
    
    const interval = setInterval(() => {
      checkStatus();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'UP':
        return 'green';
      case 'DOWN':
        return 'red';
      default:
        return 'orange';
    }
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h2 className="card-title">Service Status</h2>
      
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center p-4">Checking status...</div>
      ) : (
        <div>
          <div className="flex justify-between" style={{ marginBottom: '10px' }}>
            <span>Backend:</span>
            <span style={{ 
              color: getStatusColor(status.overall),
              fontWeight: 'bold'
            }}>
              {status.overall === 'UP' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex justify-between" style={{ marginBottom: '10px' }}>
            <span>PostgreSQL:</span>
            <span style={{ 
              color: getStatusColor(status.postgres),
              fontWeight: 'bold'
            }}>
              {status.postgres === 'UP' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Redis Cluster:</span>
            <span style={{ 
              color: getStatusColor(status.redis),
              fontWeight: 'bold'
            }}>
              {status.redis === 'UP' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {(status.postgres !== 'UP' || status.redis !== 'UP') && (
            <div className="alert alert-error" style={{ marginTop: '15px' }}>
              <p>
                {status.postgres !== 'UP' && status.redis !== 'UP' ? (
                  'Both PostgreSQL and Redis Cluster are currently unavailable. Some features may not work.'
                ) : status.postgres !== 'UP' ? (
                  'PostgreSQL is currently unavailable. Features depending on it may not work.'
                ) : (
                  'Redis Cluster is currently unavailable. Features depending on it may not work.'
                )}
              </p>
            </div>
          )}
          
          <div className="text-center" style={{ marginTop: '15px' }}>
            <button 
              onClick={checkStatus}
              className="btn btn-secondary"
              style={{ fontSize: '0.9rem', padding: '5px 10px' }}
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus;