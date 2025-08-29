-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{
    "allowMultipleVotes": false,
    "isPublic": true,
    "showResults": "after_vote",
    "allowAnonymous": true
  }'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table for authenticated users
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Create anonymous_votes table for public voting
CREATE TABLE IF NOT EXISTS public.anonymous_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  session_id TEXT,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_creator_id ON public.polls(creator_id);
CREATE INDEX IF NOT EXISTS idx_polls_share_id ON public.polls(share_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_votes_poll_id ON public.anonymous_votes(poll_id);
