import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link from react-router-dom

const ApplyLeave = () => {
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // useNavigate hook for navigation

  // Define API base URL based on environment
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // Empty string for relative URLs in production
    : 'http://localhost:10000';

  const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setMessage('The end date cannot be before the start date. Please correct it.');
      return false;
    }
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate dates before making the API request
    if (!validateDateRange(startDate, endDate)) {
      return; // Exit the function if dates are invalid
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/leaves/apply`, // Use the API base URL
        { leaveType, startDate, endDate, reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      // After successful application, navigate to the dashboard
      navigate('/dashboard');  // Correct usage of navigate in React Router v6
    } catch (error) {
      // Set the error message if the server responds with an error message
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An error occurred while applying for leave.');
      }
      console.error('Error applying leave:', error);
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

      <div className="content-section">
        <h2>Apply for Leave</h2>
        {message && <div className="error-message">{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="leaveType">Leave Type</label>
            <select 
              id="leaveType"
              value={leaveType} 
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="casual">Casual Leave</option>
              <option value="medical">Medical Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Leave</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide details about your leave request"
              required
            ></textarea>
          </div>

          <button type="submit">Submit Application</button>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
