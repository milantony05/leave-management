const { v4: uuidv4 } = require('uuid');
const db = require('../db');

class User {
  constructor(userData) {
    this.userId = userData.userId || uuidv4();
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || 'student';
    this.casualLeaveBalance = userData.casualLeaveBalance || 10;
    this.medicalLeaveBalance = userData.medicalLeaveBalance || 10;
  }

  static async findById(userId) {
    console.log('Finding user by ID:', userId);
    try {
      const result = await db.execute(
        `SELECT * FROM USERS WHERE USER_ID = :userId`,
        { userId },
        { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length === 0) {
        console.log('No user found with ID:', userId);
        return null;
      }

      const userData = result.rows[0];
      console.log('User found:', userData.USER_ID);
      return new User({
        userId: userData.USER_ID,
        username: userData.USERNAME,
        email: userData.EMAIL,
        password: userData.PASSWORD,
        role: userData.ROLE,
        casualLeaveBalance: userData.CASUAL_LEAVE_BALANCE,
        medicalLeaveBalance: userData.MEDICAL_LEAVE_BALANCE
      });
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findOne(criteria) {
    let query = 'SELECT * FROM USERS WHERE 1=1';
    const binds = {};

    if (criteria.email) {
      query += ' AND EMAIL = :email';
      binds.email = criteria.email;
    }

    if (criteria._id) {
      query += ' AND USER_ID = :userId';
      binds.userId = criteria._id;
    }

    try {
      const result = await db.execute(
        query,
        binds,
        { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length === 0) {
        return null;
      }

      const userData = result.rows[0];
      return new User({
        userId: userData.USER_ID,
        username: userData.USERNAME,
        email: userData.EMAIL,
        password: userData.PASSWORD,
        role: userData.ROLE,
        casualLeaveBalance: userData.CASUAL_LEAVE_BALANCE,
        medicalLeaveBalance: userData.MEDICAL_LEAVE_BALANCE
      });
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async save() {
    console.log('Saving user:', { 
      userId: this.userId, 
      username: this.username,
      casualLeaveBalance: this.casualLeaveBalance,
      medicalLeaveBalance: this.medicalLeaveBalance
    });

    try {
      const exists = await User.findOne({ email: this.email });

      if (exists && exists.userId !== this.userId) {
        throw new Error('User with this email already exists');
      }

      const result = await db.execute(
        `MERGE INTO USERS u
         USING (SELECT :userId AS USER_ID FROM DUAL) d
         ON (u.USER_ID = d.USER_ID)
         WHEN MATCHED THEN
           UPDATE SET
             u.USERNAME = :username,
             u.EMAIL = :email,
             u.PASSWORD = :password,
             u.ROLE = :role,
             u.CASUAL_LEAVE_BALANCE = :casualLeaveBalance,
             u.MEDICAL_LEAVE_BALANCE = :medicalLeaveBalance
         WHEN NOT MATCHED THEN
           INSERT (USER_ID, USERNAME, EMAIL, PASSWORD, ROLE, CASUAL_LEAVE_BALANCE, MEDICAL_LEAVE_BALANCE)
           VALUES (:userId, :username, :email, :password, :role, :casualLeaveBalance, :medicalLeaveBalance)`,
        {
          userId: this.userId,
          username: this.username,
          email: this.email,
          password: this.password,
          role: this.role,
          casualLeaveBalance: this.casualLeaveBalance,
          medicalLeaveBalance: this.medicalLeaveBalance
        }
      );

      console.log('User saved successfully');
      return this;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  get _id() {
    return this.userId;
  }
}

module.exports = User;
