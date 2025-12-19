-- DevFlow RLS Policy Updates
-- Run these in Supabase SQL Editor to fix leaderboard access

-- Allow viewing users who opt into leaderboard display
DROP POLICY IF EXISTS "Leaderboard users viewable" ON users;
CREATE POLICY "Leaderboard users viewable" ON users
  FOR SELECT USING (
    show_on_leaderboard = true
  );

-- Note: The service role key bypasses RLS, so API routes will work regardless
-- But this policy allows client-side queries for leaderboard data if needed
