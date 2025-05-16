import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Components
import Navigation from './components/Navigation';
import DataForm from './components/DataForm';
import PostgresData from './components/PostgresData';
import RedisData from './components/RedisData';

// Home page component with architecture diagram
const Home = () => (
  <div>
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-semibold mb-4">Data Flow Application</h2>
      <p className="mb-4">
        This application demonstrates connectivity between a React frontend, Node.js/Express backend, 
        PostgreSQL database, and Redis cluster.
      </p>
      
      <div className="w-full bg-gray-100 p-6 rounded-lg shadow-md mb-4">
        <h3 className="text-lg font-semibold text-center mb-6">Application Architecture</h3>
        
        <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 w-full max-w-4xl">
            {/* Frontend */}
            <div className="bg-blue-100 p-4 rounded-lg flex flex-col items-center justify-center shadow-md">
              <div className="text-blue-600 text-4xl mb-2">🌐</div>
              <div className="text-center">
                <h3 className="font-bold">Frontend</h3>
                <p className="text-sm">React</p>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="text-gray-500 text-4xl">→</div>
            </div>
            
            {/* Backend */}
            <div className="bg-green-100 p-4 rounded-lg flex flex-col items-center justify-center shadow-md">
              <div className="text-green-600 text-4xl mb-2">🖥️</div>
              <div className="text-center">
                <h3 className="font-bold">Backend</h3>
                <p className="text-sm">Node.js/Express</p>
              </div>
            </div>
            
            {/* Storage */}
            <div className="flex flex-col gap-4">
              {/* PostgreSQL */}
              <div className="bg-purple-100 p-4 rounded-lg flex flex-col items-center justify-center shadow-md">
                <div className="text-purple-600 text-4xl mb-2">💾</div>
                <div className="text-center">
                  <h3 className="font-bold">PostgreSQL</h3>
                  <p className="text-sm">Persistent Storage</p>
                </div>
              </div>
              
              {/* Redis */}
              <div className="bg-red-100 p-4 rounded-lg flex flex-col items-center justify-center shadow-md">
                <div className="text-red-600 text-4xl mb-2">📊</div>
                <div className="text-center">
                  <h3 className="font-bold">Redis</h3>
                  <p className="text-sm">In-memory Storage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <DataForm />
  </div>
);

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto p-4">
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