import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 

// Define the API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // Empty string for relative URLs in production
    : 'http://localhost:10000'; 

const AdminPanel = () => {
  const [applications, setApplications] = useState([]);
  const [grantedApplications, setGrantedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set active view based on URL hash
    if (location.hash === '#about') {
      setActiveView('about');
    } else {
      setActiveView('dashboard');
      fetchApplications();
    }
  }, [location.hash]);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaves/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const allApplications = response.data;
      
      // Split applications into granted and rejected
      const granted = allApplications.filter(app => app.status === 'approved');
      const rejected = allApplications.filter(app => app.status === 'rejected');
      
      setApplications(allApplications);
      setGrantedApplications(granted);
      setRejectedApplications(rejected);
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      setError('Error loading leave applications. Please try again later.');
    }
  };

  const handleApproval = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/leaves/approve`, { applicationId: id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Update application lists
      const updatedApp = applications.find(app => 
        app._id === id || app.applicationId === id
      );
      setApplications(prevApps => 
        prevApps.map(app => 
          (app._id === id || app.applicationId === id) ? 
          { ...app, status: 'approved' } : app
        )
      );
      setGrantedApplications(prevGrants => [...prevGrants, { ...updatedApp, status: 'approved' }]);
      setRejectedApplications(prevRejects => 
        prevRejects.filter(app => 
          app._id !== id && app.applicationId !== id
        )
      );
    } catch (error) {
      console.error('Error approving leave application:', error);
      setError('Failed to approve the leave application. Please try again.');
    }
  };

  const handleRejection = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/leaves/reject`, { applicationId: id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Update application lists
      const updatedApp = applications.find(app => 
        app._id === id || app.applicationId === id
      );
      setApplications(prevApps => 
        prevApps.map(app => 
          (app._id === id || app.applicationId === id) ? 
          { ...app, status: 'rejected' } : app
        )
      );
      setRejectedApplications(prevRejects => [...prevRejects, { ...updatedApp, status: 'rejected' }]);
      setGrantedApplications(prevGrants => 
        prevGrants.filter(app => 
          app._id !== id && app.applicationId !== id
        )
      );
    } catch (error) {
      console.error('Error rejecting leave application:', error);
      setError('Failed to reject the leave application. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  // Handle navigation without leaving the admin context
  const handleNavigation = (view) => {
    setActiveView(view);
    window.location.hash = view === 'about' ? '#about' : '';
  };

  // Helper function to format dates in dd/mm/yyyy format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Render the About content
  const renderAboutContent = () => {
    return (
      <div className="content-section">
        <h2>About Us</h2>
        <p>
          Welcome to our application! We provide a streamlined and efficient way to manage and apply for leave.
          Our goal is to simplify the leave application process and provide a user-friendly experience for both employees and administrators.
        </p>
        <p>
          If you have any questions or feedback, please feel free to reach out to us at <a href="mailto:support@example.com">support@example.com</a>.
        </p>
        <p>
          Thank you for using our application!
        </p>
      </div>
    );
  };

  // Render the dashboard content
  const renderDashboardContent = () => {
    return (
      <div className="content-section compact-content">
        <div className="user-greeting">
          <h2>Admin Dashboard</h2>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="admin-section compact-section">
          <h3>Pending Leave Applications</h3>
          {applications.filter(app => app.status === 'pending').length > 0 ? (
            <ul className="application-list compact-list">
              {applications.filter(app => app.status === 'pending').map(app => (
                <li key={app._id || app.applicationId} className="application-item admin-item compact-item">
                  <div className="application-header">
                    <strong>{app.userId?.username || 'Unknown User'}</strong>
                    <span className="app-email">({app.userId?.email || 'No email'})</span>
                    <span className={`status-badge ${getStatusClass(app.status)}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                  <div className="application-details compact-details">
                    <strong>{app.leaveType.charAt(0).toUpperCase() + app.leaveType.slice(1)} Leave</strong>: {formatDate(app.startDate)} - {formatDate(app.endDate)}
                  </div>
                  <div className="admin-actions compact-actions">
                    <button 
                      onClick={() => handleApproval(app._id || app.applicationId)}
                      className="approve-btn btn-sm"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejection(app._id || app.applicationId)}
                      className="reject-btn btn-sm"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending leave applications.</p>
          )}
        </div>

        <div className="admin-grid">
          <div className="admin-section compact-section half-width">
            <h3>Approved Leaves</h3>
            {grantedApplications.length > 0 ? (
              <ul className="application-list compact-list">
                {grantedApplications.map(app => (
                  <li key={app._id || app.applicationId} className="application-item compact-item">
                    <div className="application-header">
                      <strong>{app.userId?.username || 'Unknown User'}</strong>
                      <span className={`status-badge ${getStatusClass(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <div className="application-details compact-details">
                      <strong>{app.leaveType.charAt(0).toUpperCase() + app.leaveType.slice(1)}</strong>: {formatDate(app.startDate)} - {formatDate(app.endDate)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No approved leave applications.</p>
            )}
          </div>

          <div className="admin-section compact-section half-width">
            <h3>Rejected Leaves</h3>
            {rejectedApplications.length > 0 ? (
              <ul className="application-list compact-list">
                {rejectedApplications.map(app => (
                  <li key={app._id || app.applicationId} className="application-item compact-item">
                    <div className="application-header">
                      <strong>{app.userId?.username || 'Unknown User'}</strong>
                      <span className={`status-badge ${getStatusClass(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <div className="application-details compact-details">
                      <strong>{app.leaveType.charAt(0).toUpperCase() + app.leaveType.slice(1)}</strong>: {formatDate(app.startDate)} - {formatDate(app.endDate)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No rejected leave applications.</p>
            )}
          </div>
        </div>
      </div>
    );
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
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleNavigation('dashboard'); }}
                className={activeView === 'dashboard' ? 'active' : ''}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                onClick={(e) => { e.preventDefault(); handleNavigation('about'); }}
                className={activeView === 'about' ? 'active' : ''}
              >
                About
              </a>
            </li>
          </div>
          <div className="nav-right">
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </div>
        </ul>
      </nav>

      {activeView === 'about' ? renderAboutContent() : renderDashboardContent()}
    </div>
  );
};

export default AdminPanel;
