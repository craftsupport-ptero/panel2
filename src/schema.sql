-- Database schema for testing
-- This should be run in the D1 database

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  root_admin BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Insert a test admin user
-- Password: AdminPassword123!
-- Hash generated with bcrypt rounds 12
INSERT INTO users (
  username, 
  email, 
  password, 
  first_name, 
  last_name, 
  root_admin, 
  created_at, 
  updated_at
) VALUES (
  'admin',
  'admin@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeN/KdC.N0Hvmx6/.',
  'Admin',
  'User',
  TRUE,
  datetime('now'),
  datetime('now')
);

-- Insert a test regular user  
-- Password: UserPassword123!
-- Hash generated with bcrypt rounds 12
INSERT INTO users (
  username,
  email, 
  password,
  first_name,
  last_name,
  root_admin,
  created_at,
  updated_at
) VALUES (
  'testuser',
  'user@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeN/KdC.N0Hvmx6/.',
  'Test',
  'User', 
  FALSE,
  datetime('now'),
  datetime('now')
);