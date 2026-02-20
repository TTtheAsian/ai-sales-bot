-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id TEXT NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    webhook_secret TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: rules
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    reply_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(account_id, keyword)
);

-- Table: unmatched_queries (for analytics/learning)
CREATE TABLE unmatched_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    message_content TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Optional but recommended - Basic setup for service role access)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE unmatched_queries ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo purposes (adjust for production!)
CREATE POLICY "Public read access" ON accounts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON rules FOR SELECT USING (true);
