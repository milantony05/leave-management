import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:10000';
      const response = await axios.post(`${API_BASE_URL}/api/login`, { email, password });
      const { token, role } = response.data;

      // Store the token and role in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // Navigate based on the user's role
      if (role === 'admin') {
        navigate('/admin'); // Redirect to the admin panel
      } else {
        navigate('/dashboard'); // Redirect to the user dashboard
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An error occurred during login.');
      }
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Leave Management System</h1>
      </header>
      <div className="content-section">
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            {message && <div className="error-message">{message}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button type="submit" style={{ width: '100%' }}>Sign In</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
