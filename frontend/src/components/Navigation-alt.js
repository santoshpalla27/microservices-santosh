import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav>
      <div className="container">
        <div className="nav-brand">
          Data Flow App
        </div>
        <div className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
            end
          >
            Home
          </NavLink>
          <NavLink 
            to="/postgres" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            PostgreSQL Data
          </NavLink>
          <NavLink 
            to="/redis" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
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