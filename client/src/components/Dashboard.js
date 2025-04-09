import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [balance, setBalance] = useState({});
  const [applications, setApplications] = useState([]);
  const [username, setUsername] = useState('Guest');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // useNavigate hook for navigation

  // Define API base URL based on environment
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // Empty string for relative URLs in production
    : 'http://localhost:10000';

  useEffect(() => {
    // Fetch user details
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/details`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsername(response.data.username);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details.');
      }
    };

    // Fetch leave balance
    const fetchBalance = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/leaves/balance`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBalance(response.data);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setError('Failed to load leave balance.');
      }
    };

    // Fetch leave applications
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/leaves/history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching leave applications:', error);
        setError('Failed to load leave applications.');
      }
    };

    // Call the fetch functions
    fetchUserDetails();
    fetchBalance();
    fetchApplications();
  }, [API_BASE_URL]); // Include API_BASE_URL in the dependency array

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    navigate('/login'); // Redirect to login page
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Leave Management System</h1>
      </header>
      {/* Navigation Bar */}
      <nav>
        <ul>
          <div className="nav-center">
            <li>
              <Link to="/dashboard">Home</Link>
            </li>
            <li>
              <Link to="/apply-leave">Apply Leave</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </div>
          <div className="nav-right">
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </div>
        </ul>
      </nav>

      {/* Dashboard Content */}
      <div className="content-section">
        <div className="user-greeting">
          <h2>Welcome, {username}!</h2>
        </div>

        {/* Display error message if there is one */}
        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Leave Balance</h3>
            <div className="balance-info">
              <p><strong>Casual Leave:</strong> {balance.casualLeaveBalance || 0} days</p>
              <p><strong>Medical Leave:</strong> {balance.medicalLeaveBalance || 0} days</p>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Leave Applications</h3>
            {applications.length > 0 ? (
              <ul className="application-list">
                {applications.map(app => (
                  <li key={app._id} className="application-item">
                    <div className="application-type">
                      <strong>{app.leaveType.charAt(0).toUpperCase() + app.leaveType.slice(1)} Leave</strong>
                    </div>
                    <div className="application-dates">
                      {new Date(app.startDate).toLocaleDateString()} to {new Date(app.endDate).toLocaleDateString()}
                    </div>
                    <div className="application-status">
                      Status: <span className={getStatusClass(app.status)}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No leave applications found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
