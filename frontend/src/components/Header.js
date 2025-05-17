import React from 'react';

function Header({ isAuthenticated, onLogout }) {
  return (
    <header className="header">
      <div className="container header-container">
        <div>
          <h1>MultiTech Task Manager</h1>
          <p>Manage your tasks efficiently</p>
        </div>
        {isAuthenticated && (
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;