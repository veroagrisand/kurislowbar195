-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  date DATE NOT NULL,
  time TIME NOT NULL,
  people INTEGER NOT NULL,
  coffee_id VARCHAR(100) NOT NULL,
  coffee_name VARCHAR(255) NOT NULL,
  coffee_price INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  payment_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create coffee_options table
CREATE TABLE IF NOT EXISTS coffee_options (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations(phone);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
