import React, { useState } from 'react';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted with:', email, password);
    onLogin({ email, password });
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    console.log('Demo login clicked');
    // Use default values already set in state
    onLogin({ email: 'demo@example.com', password: 'password123' });
  };

  return (
    <div className="login-form">
      <h2>Login to Your Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="login-button">Login</button>
          <button type="button" onClick={handleDemoLogin} className="demo-button">
            Quick Demo Login
          </button>
        </div>
      </form>
      <p className="login-hint">
        <strong>For demo:</strong> Click "Quick Demo Login" to login with demo credentials.
      </p>
    </div>
  );
}

export default LoginForm;