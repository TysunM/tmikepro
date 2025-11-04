-- This script updates the database to support the integrated Gemini chatbot
-- It should be run *after* the main db.sql script.

-- 1. Add chatbot_tier to users table if it doesn't exist
DO $$
BEGIN
    -- First, check if the ENUM type exists. If not, create it.
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chatbot_tier') THEN
        CREATE TYPE chatbot_tier AS ENUM ('free', 'premium', 'enterprise');
    END IF;

    -- Now, check if the column exists in the users table. If not, add it.
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'chatbot_tier'
    ) THEN
        ALTER TABLE users
        ADD COLUMN chatbot_tier chatbot_tier DEFAULT 'free';
    END IF;
END $$;

-- 2. Create chat_sessions table
-- This table stores a record of each conversation
CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_title VARCHAR(255) DEFAULT 'New Chat'
);

-- 3. Create chat_messages table
-- This table stores every message, linking it to a session
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    -- 'role' stores who sent the message: 'user' or 'model'
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add indexes for faster chat history retrieval
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
