-- This script should be run only once to create the initial admin user.
-- In a production environment, ensure this is handled securely (e.g., via environment variables or a setup process).

-- Check if the default admin user already exists to prevent duplicates
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin') THEN
        -- Hash the default password 'password123'
        -- You should replace 'password123' with a strong, randomly generated password
        -- and store it securely, e.g., in environment variables.
        INSERT INTO admin_users (username, password_hash, email, full_name, role, is_active)
        VALUES (
            'admin',
            crypt('password123', gen_salt('bf')), -- 'password123' is the default password
            'admin@example.com',
            'Default Admin',
            'admin',
            TRUE
        );
    END IF;
END $$;
