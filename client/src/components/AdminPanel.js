import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 

// Define the API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // Empty string for relative URLs in production
    : 'http://localhost:10000'; 

const AdminPanel = () => {
  const [applications, setApplications] = useState([]);
  const [grantedApplications, setGrantedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/leaves/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const allApplications = response.data;
        
        // Split applications into granted and rejected
        const granted = allApplications.filter(app => app.status === 'approved');
        const rejected = allApplications.filter(app => app.status === 'rejected');
        const pending = allApplications.filter(app => app.status === 'pending');
        
        setApplications(allApplications);
        setGrantedApplications(granted);
        setRejectedApplications(rejected);
      } catch (error) {
        console.error('Error fetching leave applications:', error);
        setError('Error loading leave applications. Please try again later.');
      }
    };

    fetchApplications();
  }, []);

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

  return (
    <div className="container">
      <header className="app-header">
        <h1>Leave Management System</h1>
      </header>
      <nav>
        <ul>
          <li>
            <Link to="/admin">Dashboard</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>

      <div className="content-section">
        <div className="user-greeting">
          <h2>Admin Dashboard</h2>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="admin-section">
          <h3>Pending Leave Applications</h3>
          {applications.filter(app => app.status === 'pending').length > 0 ? (
            <ul className="application-list">
              {applications.filter(app => app.status === 'pending').map(app => (
                <li key={app._id || app.applicationId} className="application-item admin-item">
                  <div className="application-type">
                    <strong>{app.userId?.username || 'Unknown User'}</strong> ({app.userId?.email || 'No email'})
                  </div>
                  <div className="application-details">
                    Applied for <strong>{app.leaveType.charAt(0).toUpperCase() + app.leaveType.slice(1)} Leave</strong> from {new Date(app.startDate).toLocaleDateString()} to {new Date(app.endDate).toLocaleDateString()}
                  </div>
                  <div className="application-status">
                    Status: <span className={getStatusClass(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                  <div className="admin-actions">
                    <button 
                      onClick={() => handleApproval(app._id || app.applicationId)}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejection(app._id || app.applicationId)}
                      className="reject-btn"
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

        <div className="admin-section">
          <h3>Approved Leave Applications</h3>
          {grantedApplications.length > 0 ? (
            <ul className="application-list">
              {grantedApplications.map(app => (
                <li key={app._id || app.applicationId} className="application-item">
                  <div className="application-type">
                    <strong>{app.userId?.username || 'Unknown User'}</strong> ({app.userId?.email || 'No email'})
                  </div>
                  <div className="application-details">
                    <strong>{app.leaveType.charAt(0).toUpperCase() + app.leaveType.slice(1)} Leave</strong> from {new Date(app.startDate).toLocaleDateString()} to {new Date(app.endDate).toLocaleDateString()}
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
            <p>No approved leave applications.</p>
          )}
        </div>

        <div className="admin-section">
          <h3>Rejected Leave Applications</h3>
          {rejectedApplications.length > 0 ? (
            <ul className="application-list">
              {rejectedApplications.map(app => (
                <li key={app._id || app.applicationId} className="application-item">
                  <div className="application-type">
                    <strong>{app.userId?.username || 'Unknown User'}</strong> ({app.userId?.email || 'No email'})
                  </div>
                  <div className="application-details">
                    <strong>{app.leaveType.charAt(0).toUpperCase() + app.leaveType.slice(1)} Leave</strong> from {new Date(app.startDate).toLocaleDateString()} to {new Date(app.endDate).toLocaleDateString()}
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
            <p>No rejected leave applications.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
