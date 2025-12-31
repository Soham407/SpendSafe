-- Initial Schema for SpendSafe

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  tax_rate_percentage DECIMAL DEFAULT 0.30,
  retirement_rate_percentage DECIMAL DEFAULT 0.10,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  notification_preference TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Income Events Table
CREATE TABLE IF NOT EXISTS public.income_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'manual', -- 'manual' or 'plaid'
  amount DECIMAL NOT NULL,
  description TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_confirmed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending_action', -- 'pending_confirmation', 'pending_action', 'completed', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on income_events
ALTER TABLE public.income_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income events" 
  ON public.income_events FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income events" 
  ON public.income_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income events" 
  ON public.income_events FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3. Recommended Moves Table
CREATE TABLE IF NOT EXISTS public.recommended_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  income_event_id UUID REFERENCES public.income_events(id) ON DELETE CASCADE,
  bucket_name TEXT NOT NULL, -- 'Tax', 'Retirement'
  amount_to_move DECIMAL NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_method TEXT, -- 'confirmed', 'manual_transfer', 'postponed', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on recommended_moves
ALTER TABLE public.recommended_moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommended moves" 
  ON public.recommended_moves FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.income_events 
      WHERE public.income_events.id = public.recommended_moves.income_event_id 
      AND public.income_events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own recommended moves" 
  ON public.recommended_moves FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.income_events 
      WHERE public.income_events.id = public.recommended_moves.income_event_id 
      AND public.income_events.user_id = auth.uid()
    )
  );

-- 4. Yearly Summaries Table (Caching for Panic Button)
CREATE TABLE IF NOT EXISTS public.yearly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_income DECIMAL DEFAULT 0,
  total_tax_should_save DECIMAL DEFAULT 0,
  total_tax_actually_saved DECIMAL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- Enable RLS on yearly_summaries
ALTER TABLE public.yearly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own yearly summaries" 
  ON public.yearly_summaries FOR SELECT 
  USING (auth.uid() = user_id);

-- Function to handle profile updates
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
