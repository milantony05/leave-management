const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const LeaveApplication = require('./models/LeaveApplication');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Initialize Oracle database connection
db.initialize()
  .then(() => {
    console.log('Connected to Oracle Database');
    insertAdminUser(); // Call the function to insert admin if not present
  })
  .catch((err) => {
    console.error('Error connecting to Oracle Database:', err);
  });

// Middleware for token validation
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => { // Use env variable for secret
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Function to insert admin user if not present
const insertAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const adminUser = new User({
        username: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        casualLeaveBalance: 0,
        medicalLeaveBalance: 0,
      });
      await adminUser.save();
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error inserting admin user:', error);
  }
};

// Routes
app.get('/api/user/details', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).send('User not found');
    res.json({ username: user.username });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Register Endpoint with Email Check
app.post('/api/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login Endpoint with role-based redirection
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// Helper function to calculate the number of days between two dates
const calculateLeaveDays = (startDate, endDate) => {
  console.log('Calculating leave days for:', { startDate, endDate });
  
  // Ensure we're working with Date objects
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  console.log('Converted dates:', { start, end });
  
  // Calculate difference in milliseconds and convert to days
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((end - start) / oneDay)) + 1;
  
  console.log('Calculated days:', diffDays);
  return diffDays;
};

// Apply for Leave Endpoint
app.post('/api/leaves/apply', authenticateToken, async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  try {
    console.log('Leave application data:', { leaveType, startDate, endDate, reason });
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log('User found:', { userId: user.userId, username: user.username });
    
    const leaveDays = calculateLeaveDays(startDate, endDate);
    console.log('Leave days calculated:', leaveDays);

    if (leaveType === 'casual' && user.casualLeaveBalance < leaveDays) {
      return res.status(400).json({ message: `You only have ${user.casualLeaveBalance} casual leave days left.` });
    } else if (leaveType === 'medical' && user.medicalLeaveBalance < leaveDays) {
      return res.status(400).json({ message: `You only have ${user.medicalLeaveBalance} medical leave days left.` });
    }

    const leaveApplication = new LeaveApplication({
      userId: user.userId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });
    
    console.log('Leave application created:', leaveApplication);

    await leaveApplication.save();
    console.log('Leave application saved successfully');
    
    res.status(201).json({ message: `Leave applied successfully for ${leaveDays} days.` });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: "Server error while applying for leave", error: error.message });
  }
});

// Get Leave Balance
app.get('/api/leaves/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      casualLeaveBalance: user.casualLeaveBalance,
      medicalLeaveBalance: user.medicalLeaveBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred while retrieving leave balance" });
  }
});

// Get Leave History
app.get('/api/leaves/history', authenticateToken, async (req, res) => {
  try {
    const applications = await LeaveApplication.find({ userId: req.user.userId });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error while retrieving leave history" });
  }
});

// Admin Endpoints
app.get('/api/leaves/all', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  
  try {
    const applications = await LeaveApplication.find();
    const populatedApplications = await LeaveApplication.populate(applications, 'userId', 'username email');
    res.json(populatedApplications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leaves/approve', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { applicationId } = req.body;
  console.log('Attempting to approve leave application:', applicationId);

  try {
    const application = await LeaveApplication.findById(applicationId);
    console.log('Application found:', application);
    
    if (application) {
      application.status = 'approved';
      
      const user = await User.findById(application.userId);
      console.log('User found:', user);
      
      const leaveDays = calculateLeaveDays(application.startDate, application.endDate);
      console.log('Leave days calculated:', leaveDays);
      
      if (application.leaveType === 'casual') {
        user.casualLeaveBalance -= leaveDays;
      } else if (application.leaveType === 'medical') {
        user.medicalLeaveBalance -= leaveDays;
      }
      
      await user.save();
      console.log('User balance updated');
      
      await application.save();
      console.log('Application status updated to approved');
      
      res.json({ message: "Leave application approved" });
    } else {
      console.log('Application not found for ID:', applicationId);
      res.status(404).json({ message: "Application not found" });
    }
  } catch (error) {
    console.error('Error approving leave:', error);
    res.status(500).json({ message: "Server error while approving leave", error: error.message });
  }
});

app.post('/api/leaves/reject', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { applicationId } = req.body;
  console.log('Attempting to reject leave application:', applicationId);

  try {
    const application = await LeaveApplication.findById(applicationId);
    console.log('Application found:', application);
    
    if (application) {
      application.status = 'rejected';
      await application.save();
      console.log('Application status updated to rejected');
      
      res.json({ message: "Leave application rejected" });
    } else {
      console.log('Application not found for ID:', applicationId);
      res.status(404).json({ message: "Application not found" });
    }
  } catch (error) {
    console.error('Error rejecting leave:', error);
    res.status(500).json({ message: "Server error while rejecting leave", error: error.message });
  }
});

// Handle graceful shutdown to close Oracle connection
process.on('SIGINT', async () => {
  try {
    await db.closePool();
    console.log('Oracle connection pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing Oracle connection pool:', err);
    process.exit(1);
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
