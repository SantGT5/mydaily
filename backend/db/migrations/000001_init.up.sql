CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create users table
CREATE TABLE users (
    hashed_password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    id UUID PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create github credentials table
CREATE TABLE github_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    user_id UUID NOT NULL UNIQUE,
    github_id BIGINT NOT NULL UNIQUE,
    github_username VARCHAR(255) NOT NULL,
    github_name VARCHAR(255),
    github_email VARCHAR(255),
    github_avatar_url TEXT,
    github_profile_url TEXT,
    access_token TEXT NOT NULL,
    token_type VARCHAR(50) NOT NULL,
    scope TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_github_credentials_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
