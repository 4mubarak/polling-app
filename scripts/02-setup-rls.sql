-- Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_votes ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Public polls are viewable by everyone" ON polls
  FOR SELECT USING (true);

CREATE POLICY "Users can create polls" ON polls
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own polls" ON polls
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own polls" ON polls
  FOR DELETE USING (auth.uid() = creator_id);

-- Votes policies
CREATE POLICY "Anyone can view votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Anonymous votes policies
CREATE POLICY "Anyone can view anonymous votes" ON anonymous_votes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert anonymous votes" ON anonymous_votes
  FOR INSERT WITH CHECK (true);
