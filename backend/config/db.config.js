const mysql = require('mysql2/promise');

// Create a connection pool to MySQL
const createPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'userdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000
  });
};

// Test database connection
const testConnection = async (pool, maxRetries = 20) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const connection = await pool.getConnection();
      console.log('MySQL database connection established successfully');
      connection.release();
      return true;
    } catch (err) {
      console.error(`Error connecting to the database (attempt ${retries + 1}/${maxRetries}):`, err);
      retries++;
      
      if (retries < maxRetries) {
        console.log(`Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('Maximum retries reached, could not connect to MySQL');
        throw err;
      }
    }
  }
  return false;
};

// Create the pool
const pool = createPool();

// Exponential backoff for query retries
const executeWithRetry = async (query, params = [], maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await pool.execute(query, params);
    } catch (err) {
      retries++;
      console.error(`Database query failed (attempt ${retries}/${maxRetries}):`, err);
      
      if (retries >= maxRetries) {
        throw err;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, retries) * 200;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Initialize the connection when the module is loaded
(async () => {
  try {
    await testConnection(pool);
  } catch (err) {
    console.error('Failed to establish database connection on startup');
    // Don't exit process here, let the application handle it
  }
})();

// Export a wrapped pool with retry capability
module.exports = {
  getConnection: async () => pool.getConnection(),
  execute: executeWithRetry,
  query: async (sql, params = []) => {
    return executeWithRetry(sql, params);
  },
  pool
};
