const oracledb = require('oracledb');
const dotenv = require('dotenv');

dotenv.config();

// Set autoCommit to true
oracledb.autoCommit = true;

// Initialize Oracle connection pool
async function initialize() {
  try {
    await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
      poolMin: 0,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log('Oracle connection pool initialized successfully');
  } catch (err) {
    console.error('Error initializing Oracle connection pool:', err);
    throw err;
  }
}

// Get a connection from the pool
async function getConnection() {
  try {
    return await oracledb.getConnection();
  } catch (err) {
    console.error('Error getting connection from pool:', err);
    throw err;
  }
}

// Close a connection
async function closeConnection(connection) {
  if (connection) {
    try {
      await connection.close();
    } catch (err) {
      console.error('Error closing connection:', err);
    }
  }
}

// Close the connection pool
async function closePool() {
  try {
    await oracledb.getPool().close(10);
    console.log('Oracle connection pool closed');
  } catch (err) {
    console.error('Error closing Oracle connection pool:', err);
  }
}

// Execute SQL query and return results
async function execute(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, options);
    return result;
  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  } finally {
    await closeConnection(connection);
  }
}

module.exports = {
  initialize,
  getConnection,
  closeConnection,
  closePool,
  execute,
  oracledb
}; 