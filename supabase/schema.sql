-- Users (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  tax_rate_percentage DECIMAL DEFAULT 0.30,
  retirement_rate_percentage DECIMAL DEFAULT 0.10,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  plaid_access_token TEXT, -- Handle encryption at app level or use vault
  notification_preference TEXT DEFAULT 'sms', -- 'sms', 'email', 'both'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income Events (Manual + Plaid)
CREATE TABLE IF NOT EXISTS public.income_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT, -- 'manual' or 'plaid'
  plaid_transaction_id TEXT,
  amount DECIMAL NOT NULL,
  description TEXT, -- Auto-delete after 90 days (can be handled by a cron job)
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_confirmed BOOLEAN DEFAULT FALSE, -- User must confirm Plaid detections
  status TEXT DEFAULT 'pending_action', -- 'pending_action', 'completed', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommended Moves (Instructions to User)
CREATE TABLE IF NOT EXISTS public.recommended_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  income_event_id UUID REFERENCES public.income_events(id) ON DELETE CASCADE,
  bucket_name TEXT NOT NULL, -- 'Tax', 'Retirement'
  amount_to_move DECIMAL NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_method TEXT, -- 'confirmed', 'postponed', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yearly Summaries (Panic Button Cache)
CREATE TABLE IF NOT EXISTS public.yearly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER,
  total_income DECIMAL DEFAULT 0,
  total_tax_should_save DECIMAL DEFAULT 0,
  total_tax_actually_saved DECIMAL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommended_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yearly_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own income events" ON public.income_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own income events" ON public.income_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own income events" ON public.income_events FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own recommended moves" ON public.recommended_moves FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.income_events WHERE id = income_event_id AND user_id = auth.uid()));

CREATE POLICY "Users can view their own yearly summaries" ON public.yearly_summaries FOR SELECT USING (auth.uid() = user_id);
