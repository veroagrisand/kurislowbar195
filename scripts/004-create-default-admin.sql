-- Insert default admin user
-- Password: admin123 (change this immediately after first login)
INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@kuricoffee.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJK9fHQe.',
    'Administrator',
    'admin'
) ON CONFLICT (username) DO NOTHING;
