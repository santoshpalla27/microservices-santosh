import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import UserForm from './components/UserForm';
import MySQLUsers from './components/MySQLUsers';
import RedisUsers from './components/RedisUsers';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('mysql');
  const [refreshData, setRefreshData] = useState(0);

  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
    toast.success('Data refreshed successfully!');
  };

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <Header />
      
      <UserForm onSuccess={handleRefresh} />
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'mysql' ? 'active' : ''}`}
          onClick={() => setActiveTab('mysql')}
        >
          MySQL Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'redis' ? 'active' : ''}`}
          onClick={() => setActiveTab('redis')}
        >
          Redis Users
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'mysql' ? (
          <MySQLUsers refreshTrigger={refreshData} onDelete={handleRefresh} />
        ) : (
          <RedisUsers refreshTrigger={refreshData} onDelete={handleRefresh} />
        )}
      </div>
    </div>
  );
}

export default App;