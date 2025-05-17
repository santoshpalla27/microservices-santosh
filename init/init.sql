CREATE DATABASE IF NOT EXISTS userdb;
USE userdb;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO users (name, email, phone) VALUES 
  ('John Doe', 'john@example.com', '123-456-7890'),
  ('Jane Smith', 'jane@example.com', '987-654-3210'),
  ('Bob Johnson', 'bob@example.com', '555-123-4567');