-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  birthday DATE, -- Added for birthday promotions
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Packages
CREATE TYPE package_t AS ENUM ('basic', 'pro', 'master');

-- Project Status Enum (For Progress Bar)
CREATE TYPE project_status_t AS ENUM (
  'intake',        -- Step 1: Client submits
  'in_progress',   -- Step 2: I start
  'static_mix',    -- Step 3: Static mix done
  'final_mix',     -- Step 4: Mix is done
  'mastered',      -- Step 5: Master is done
  'review',        -- Step 6: Ready for client review
  'revisions',
  'delivered'
);

-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  package package_t NOT NULL,
  status project_status_t NOT NULL DEFAULT 'intake', -- Using new enum
  eta TIMESTAMP,
  size TEXT DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ... (Payments and Consultations tables remain as-is) ...

-- Referrals
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER REFERENCES users(id),
  referred_email TEXT NOT NULL,
  referred_user_id INTEGER REFERENCES users(id) UNIQUE, -- Ensure one-time referral
  created_at TIMESTAMP DEFAULT NOW()
);

-- Loyalty counters (fast checks)
CREATE TABLE loyalty (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  projects_completed INTEGER DEFAULT 0,
  referrals_completed INTEGER DEFAULT 0,
  last_project_completed_at TIMESTAMP
);

-- Promotions (To define the gifts)
CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "5 Project Bonus", "Birthday Gift", "My Birthday"
  type TEXT NOT NULL, -- 'project_milestone', 'birthday', 'event'
  project_milestone_count INTEGER, -- e.g., 5
  description TEXT,
  voucher_code_prefix TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Vouchers (The actual gifts given to users)
CREATE TABLE vouchers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  promotion_id INTEGER REFERENCES promotions(id),
  code TEXT UNIQUE NOT NULL, -- e.g., "5PROJ-USER123"
  description TEXT NOT NULL,
  is_redeemed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
