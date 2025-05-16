import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Components
import Navigation from './components/Navigation-alt';
import DataForm from './components/DataForm-alt';
import PostgresData from './components/PostgresData-alt';
import RedisData from './components/RedisData-alt';

// Home page component with architecture diagram
const Home = () => (
  <div>
    <div className="card mb-4">
      <h2 className="card-title">Data Flow Application</h2>
      <p className="mb-4">
        This application demonstrates connectivity between a React frontend, Node.js/Express backend, 
        PostgreSQL database, and Redis cluster.
      </p>
      
      <div className="p-4 mb-4" style={{backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
        <h3 className="text-center mb-4">Application Architecture</h3>
        
        <div className="grid grid-cols-2">
          {/* Frontend */}
          <div className="p-3 text-center mb-3" style={{backgroundColor: '#e6f2ff', borderRadius: '8px', margin: '8px'}}>
            <div className="text-center mb-2" style={{fontSize: '2rem'}}>🌐</div>
            <div>
              <h3 className="font-bold">Frontend</h3>
              <p className="text-sm">React</p>
            </div>
          </div>
          
          {/* Backend */}
          <div className="p-3 text-center mb-3" style={{backgroundColor: '#e6ffe6', borderRadius: '8px', margin: '8px'}}>
            <div className="text-center mb-2" style={{fontSize: '2rem'}}>🖥️</div>
            <div>
              <h3 className="font-bold">Backend</h3>
              <p className="text-sm">Node.js/Express</p>
            </div>
          </div>
          
          {/* PostgreSQL */}
          <div className="p-3 text-center" style={{backgroundColor: '#f0e6ff', borderRadius: '8px', margin: '8px'}}>
            <div className="text-center mb-2" style={{fontSize: '2rem'}}>💾</div>
            <div>
              <h3 className="font-bold">PostgreSQL</h3>
              <p className="text-sm">Persistent Storage</p>
            </div>
          </div>
          
          {/* Redis */}
          <div className="p-3 text-center" style={{backgroundColor: '#ffe6e6', borderRadius: '8px', margin: '8px'}}>
            <div className="text-center mb-2" style={{fontSize: '2rem'}}>📊</div>
            <div>
              <h3 className="font-bold">Redis</h3>
              <p className="text-sm">In-memory Storage</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm" style={{color: '#666'}}>
        <p>The application allows storing data in either PostgreSQL or Redis and viewing data from both sources.</p>
      </div>
    </div>
    
    <DataForm />
  </div>
);

function App() {
  return (
    <div>
      <Navigation />
      <div className="container" style={{padding: '16px'}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/postgres" element={<PostgresData />} />
          <Route path="/redis" element={<RedisData />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;