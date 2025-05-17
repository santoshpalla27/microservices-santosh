import React, { useState } from 'react';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  // For demo purposes - quick login
  const handleDemoLogin = () => {
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
        <button type="submit">Login</button>
        <button type="button" onClick={handleDemoLogin} className="demo-button">
          Quick Demo Login
        </button>
      </form>
      <p className="login-hint">
        <strong>For demo:</strong> Click "Quick Demo Login" to login with demo credentials. 
        Or register a new account.
      </p>
    </div>
  );
}

export default LoginForm;