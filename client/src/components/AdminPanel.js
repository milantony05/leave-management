import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

// Define the API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // Empty string for relative URLs in production
    : 'http://localhost:10000'; 

const AdminPanel = () => {
  const [applications, setApplications] = useState([]);
  const [grantedApplications, setGrantedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/leaves/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const allApplications = response.data;
        
        console.log('Fetched applications:', allApplications);
        if (allApplications.length > 0) {
          console.log('Sample application:', allApplications[0]);
          console.log('Application ID:', allApplications[0]._id || allApplications[0].applicationId);
        }

        // Split applications into granted and rejected
        const granted = allApplications.filter(app => app.status === 'approved');
        const rejected = allApplications.filter(app => app.status === 'rejected');
        const pending = allApplications.filter(app => app.status === 'pending');
        
        console.log(`Found ${pending.length} pending, ${granted.length} granted, ${rejected.length} rejected applications`);

        setApplications(allApplications);
        setGrantedApplications(granted);
        setRejectedApplications(rejected);
      } catch (error) {
        console.error('Error fetching leave applications:', error);
      }
    };

    fetchApplications();
  }, []);

  const handleApproval = async (id) => {
    try {
      console.log('Approving application with ID:', id);
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
    }
  };

  const handleRejection = async (id) => {
    try {
      console.log('Rejecting application with ID:', id);
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
    }
  };

  const handleLogout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    // Redirect to the login page
    navigate('/login'); // or useNavigate('/login') if using react-router-dom v6
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Leave Management System</h1>
      </header>
      <div className="header">
        <h1>Admin Panel</h1>
        {/* Add Logout button */}
        <button onClick={handleLogout} style={{ marginLeft: 'auto', padding: '10px 20px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      
      <h2>Pending Leave Applications</h2>
      <ul>
        {applications.filter(app => app.status === 'pending').map(app => (
          <li key={app._id || app.applicationId}>
            <div>
              <strong>{app.userId?.username || 'Unknown'}</strong> ({app.userId?.email || 'Unknown'}) 
              has applied for {app.leaveType} leave from {new Date(app.startDate).toDateString()} to {new Date(app.endDate).toDateString()} - Status: {app.status}
            </div>
            <button onClick={() => handleApproval(app._id || app.applicationId)}>Approve</button>
            <button onClick={() => handleRejection(app._id || app.applicationId)}>Reject</button>
          </li>
        ))}
      </ul>

      <h2>Granted Leave</h2>
      <ul>
        {grantedApplications.map(app => (
          <li key={app._id || app.applicationId}>
            <div>
              <strong>{app.userId?.username || 'Unknown'}</strong> ({app.userId?.email || 'Unknown'}) 
              had {app.leaveType} leave from {new Date(app.startDate).toDateString()} to {new Date(app.endDate).toDateString()} - Status: {app.status}
            </div>
          </li>
        ))}
      </ul>

      <h2>Rejected Leave</h2>
      <ul>
        {rejectedApplications.map(app => (
          <li key={app._id || app.applicationId}>
            <div>
              <strong>{app.userId?.username || 'Unknown'}</strong> ({app.userId?.email || 'Unknown'}) 
              had {app.leaveType} leave from {new Date(app.startDate).toDateString()} to {new Date(app.endDate).toDateString()} - Status: {app.status}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
