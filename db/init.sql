-- Initialize database
CREATE TABLE IF NOT EXISTS data_items (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO data_items (key, value) VALUES 
  ('sample_key_1', 'This is sample data 1 in PostgreSQL'),
  ('sample_key_2', 'This is sample data 2 in PostgreSQL');