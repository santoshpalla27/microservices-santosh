import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-white font-bold text-xl mb-4 md:mb-0">
          Data Flow App
        </div>
        <div className="flex space-x-4">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-md ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`
            }
            end
          >
            Home
          </NavLink>
          <NavLink 
            to="/postgres" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-md ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`
            }
          >
            PostgreSQL Data
          </NavLink>
          <NavLink 
            to="/redis" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-md ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`
            }
          >
            Redis Data
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;