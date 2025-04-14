const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const User = require('./User');

class LeaveApplication {
  constructor(applicationData) {
    this.applicationId = applicationData.applicationId || uuidv4();
    this.userId = applicationData.userId;
    this.leaveType = applicationData.leaveType;
    this.startDate = applicationData.startDate;
    this.endDate = applicationData.endDate;
    this.status = applicationData.status || 'pending';
    this.reason = applicationData.reason || '';
  }

  static async findById(applicationId) {
    const result = await db.execute(
      `SELECT * FROM LEAVE_APPLICATIONS WHERE APPLICATION_ID = :applicationId`,
      { applicationId },
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return null;
    }

    const data = result.rows[0];
    return new LeaveApplication({
      applicationId: data.APPLICATION_ID,
      userId: data.USER_ID,
      leaveType: data.LEAVE_TYPE,
      startDate: data.START_DATE,
      endDate: data.END_DATE,
      status: data.STATUS,
      reason: data.REASON
    });
  }

  static async find(criteria = {}) {
    let query = 'SELECT * FROM LEAVE_APPLICATIONS WHERE 1=1';
    const binds = {};

    if (criteria.userId) {
      query += ' AND USER_ID = :userId';
      binds.userId = criteria.userId;
    }

    const result = await db.execute(
      query,
      binds,
      { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map(data => new LeaveApplication({
      applicationId: data.APPLICATION_ID,
      userId: data.USER_ID,
      leaveType: data.LEAVE_TYPE,
      startDate: data.START_DATE,
      endDate: data.END_DATE,
      status: data.STATUS,
      reason: data.REASON
    }));
  }

  async save() {
    console.log('Saving leave application:', {
      applicationId: this.applicationId,
      userId: this.userId,
      status: this.status,
      startDate: this.startDate,
      endDate: this.endDate
    });

    // Convert JavaScript Date objects to proper format for Oracle
    const formattedStartDate = this.startDate instanceof Date ? 
      this.startDate : 
      new Date(this.startDate);
    
    const formattedEndDate = this.endDate instanceof Date ? 
      this.endDate : 
      new Date(this.endDate);

    try {
      const result = await db.execute(
        `MERGE INTO LEAVE_APPLICATIONS la
         USING (SELECT :applicationId AS APPLICATION_ID FROM DUAL) d
         ON (la.APPLICATION_ID = d.APPLICATION_ID)
         WHEN MATCHED THEN
           UPDATE SET
             la.USER_ID = :userId,
             la.LEAVE_TYPE = :leaveType,
             la.START_DATE = :startDate,
             la.END_DATE = :endDate,
             la.STATUS = :status,
             la.REASON = :reason
         WHEN NOT MATCHED THEN
           INSERT (APPLICATION_ID, USER_ID, LEAVE_TYPE, START_DATE, END_DATE, STATUS, REASON)
           VALUES (:applicationId, :userId, :leaveType, :startDate, :endDate, :status, :reason)`,
        {
          applicationId: this.applicationId,
          userId: this.userId,
          leaveType: this.leaveType,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          status: this.status,
          reason: this.reason
        }
      );
      
      console.log('Save result:', result);
      return this;
    } catch (error) {
      console.error('Error saving leave application:', error);
      throw error;
    }
  }

  static async populate(applications, path, select) {
    if (!applications || applications.length === 0) {
      return applications;
    }

    if (Array.isArray(applications)) {
      const userIds = [...new Set(applications.map(app => app.userId))];
      
      if (userIds.length === 0) {
        return applications;
      }
      
      // Build the query dynamically
      let query = 'SELECT * FROM USERS WHERE USER_ID IN (';
      const binds = {};
      
      userIds.forEach((id, index) => {
        const paramName = `id${index}`;
        query += index === 0 ? `:${paramName}` : `, :${paramName}`;
        binds[paramName] = id;
      });
      
      query += ')';
      
      const result = await db.execute(
        query,
        binds,
        { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
      );
      
      const users = {};
      result.rows.forEach(userData => {
        users[userData.USER_ID] = {
          userId: userData.USER_ID,
          username: userData.USERNAME,
          email: userData.EMAIL
        };
      });
      
      // Add user data to applications
      return applications.map(app => {
        const populatedApp = { ...app };
        populatedApp.userId = users[app.userId] || app.userId;
        return populatedApp;
      });
    }

    const user = await User.findById(applications.userId);
    if (user) {
      const populatedApp = { ...applications };
      populatedApp.userId = {
        userId: user.userId,
        username: user.username,
        email: user.email
      };
      return populatedApp;
    }
    
    return applications;
  }

  get _id() {
    return this.applicationId;
  }
}

module.exports = LeaveApplication;
