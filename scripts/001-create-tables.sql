-- Create coffee_options table
CREATE TABLE IF NOT EXISTS coffee_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    people INTEGER NOT NULL,
    coffee_option_id UUID REFERENCES coffee_options(id) ON DELETE RESTRICT,
    coffee_name VARCHAR(255) NOT NULL, -- Denormalized for easier querying
    coffee_price NUMERIC(10, 2) NOT NULL, -- Denormalized
    total_amount NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'confirmed', 'completed', 'cancelled'
    payment_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations (date, time);
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations (phone);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations (email);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for coffee_options table
CREATE OR REPLACE TRIGGER update_coffee_options_updated_at
BEFORE UPDATE ON coffee_options
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for reservations table
CREATE OR REPLACE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
