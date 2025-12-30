-- Plaid Items Table (stores access tokens for connected banks)
CREATE TABLE IF NOT EXISTS plaid_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Plaid Accounts Table (stores individual bank accounts)
CREATE TABLE IF NOT EXISTS plaid_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES plaid_items(item_id) ON DELETE CASCADE,
  account_id TEXT NOT NULL UNIQUE,
  account_name TEXT,
  account_type TEXT,
  account_subtype TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add plaid_transaction_id to income_events if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'income_events' AND column_name = 'plaid_transaction_id'
  ) THEN
    ALTER TABLE income_events ADD COLUMN plaid_transaction_id TEXT UNIQUE;
  END IF;
END $$;

-- Add status 'pending_confirmation' if not exists
-- (income_events.status can be: 'pending_confirmation', 'pending_action', 'completed', 'dismissed')

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON plaid_items(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_user_id ON plaid_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_item_id ON plaid_accounts(item_id);
CREATE INDEX IF NOT EXISTS idx_income_events_plaid_transaction_id ON income_events(plaid_transaction_id);
CREATE INDEX IF NOT EXISTS idx_income_events_status ON income_events(status);

-- Row Level Security Policies
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own Plaid items
CREATE POLICY "Users can view own plaid items" ON plaid_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plaid items" ON plaid_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plaid items" ON plaid_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plaid items" ON plaid_items
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own Plaid accounts
CREATE POLICY "Users can view own plaid accounts" ON plaid_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plaid accounts" ON plaid_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plaid accounts" ON plaid_accounts
  FOR DELETE USING (auth.uid() = user_id);
