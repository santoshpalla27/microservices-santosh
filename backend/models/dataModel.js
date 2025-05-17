const db = require('../config/postgres');

const DataModel = {
  // Save data to PostgreSQL
  saveToPostgres: async (key, value) => {
    try {
      const query = 'INSERT INTO data_items (key, value) VALUES ($1, $2) RETURNING *';
      const values = [key, value];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error saving to PostgreSQL: ${error.message}`);
    }
  },

  // Get all data from PostgreSQL
  getAllFromPostgres: async () => {
    try {
      const query = 'SELECT * FROM data_items ORDER BY created_at DESC';
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting data from PostgreSQL: ${error.message}`);
    }
  }
};

module.exports = DataModel;