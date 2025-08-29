-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{
    "allowMultipleVotes": false,
    "showResults": "after_vote",
    "isPublic": true
  }'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table for authenticated users
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Anonymous votes table for public polls
CREATE TABLE IF NOT EXISTS anonymous_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  ip_hash TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_creator_id ON polls(creator_id);
CREATE INDEX IF NOT EXISTS idx_polls_share_id ON polls(share_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_votes_poll_id ON anonymous_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
