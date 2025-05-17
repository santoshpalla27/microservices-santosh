const mysql = require('mysql2/promise');

// Create a connection pool to MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'userdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL database connection established successfully');
    connection.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
    setTimeout(testConnection, 5000); // Retry connection after 5 seconds
  }
}

testConnection();

module.exports = pool;