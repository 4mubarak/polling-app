-- Enable Row Level Security on all tables
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_votes ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Anyone can view polls" ON public.polls
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create polls" ON public.polls
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own polls" ON public.polls
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own polls" ON public.polls
  FOR DELETE USING (auth.uid() = creator_id);

-- Votes policies (authenticated users)
CREATE POLICY "Anyone can view votes" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON public.votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.votes
  FOR DELETE USING (auth.uid() = user_id);

-- Anonymous votes policies
CREATE POLICY "Anyone can view anonymous votes" ON public.anonymous_votes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create anonymous votes" ON public.anonymous_votes
  FOR INSERT WITH CHECK (true);

-- No update/delete policies for anonymous votes to prevent tampering
