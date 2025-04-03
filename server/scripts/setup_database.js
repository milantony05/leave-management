const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

async function setupDatabase() {
  try {
    // Initialize the Oracle connection pool
    await db.initialize();

    // Read the SQL script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'create_tables.sql'), 'utf-8');
    
    // Split the SQL script into individual statements
    const statements = sqlScript.split(';').filter(statement => statement.trim());
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await db.execute(statement.trim());
        console.log('Executed statement successfully');
      } catch (error) {
        // Ignore ORA-00942 (table or view does not exist) when dropping tables
        if (error.errorNum !== 942) {
          console.error(`Error executing statement: ${statement.trim()}`);
          console.error(error);
        }
      }
    }
    
    // Insert admin user if not exists
    await insertAdminUser();
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the connection pool
    await db.closePool();
  }
}

async function insertAdminUser() {
  try {
    // Check if admin user exists
    const result = await db.execute(
      `SELECT COUNT(*) AS COUNT FROM USERS WHERE EMAIL = :email`,
      ['admin@gmail.com']
    );
    
    const count = result.rows[0][0];
    
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const userId = uuidv4();
      
      await db.execute(
        `INSERT INTO USERS (USER_ID, USERNAME, EMAIL, PASSWORD, ROLE, CASUAL_LEAVE_BALANCE, MEDICAL_LEAVE_BALANCE) 
         VALUES (:userId, :username, :email, :password, :role, :casualLeaveBalance, :medicalLeaveBalance)`,
        [userId, 'admin', 'admin@gmail.com', hashedPassword, 'admin', 0, 0]
      );
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error inserting admin user:', error);
  }
}

// Run the setup
setupDatabase(); 