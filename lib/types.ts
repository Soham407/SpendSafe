// User profile from Supabase
export interface Profile {
  id: string;
  email: string | null;
  tax_rate_percentage: number;
  retirement_rate_percentage: number;
  two_factor_enabled: boolean;
  plaid_access_token: string | null;
  notification_preference: "sms" | "email" | "both";
  phone_number: string | null;
  minimum_buffer: number | null;
  created_at: string;
}

// Income event from database
export interface IncomeEvent {
  id: string;
  user_id: string;
  source: "manual" | "plaid";
  plaid_transaction_id: string | null;
  amount: number;
  description: string | null;
  detected_at: string;
  user_confirmed: boolean;
  status: "pending_action" | "completed" | "dismissed";
  created_at: string;
  recommended_moves?: RecommendedMove[];
}

// Recommended money movement
export interface RecommendedMove {
  id: string;
  income_event_id: string;
  bucket_name: "Tax" | "Retirement";
  amount_to_move: number;
  completed_at: string | null;
  completion_method:
    | "confirmed"
    | "postponed"
    | "dismissed"
    | "manual_transfer"
    | null;
  created_at: string;
}

// Yearly summary for Panic Button
export interface YearlySummary {
  id: string;
  user_id: string;
  year: number;
  total_income: number;
  total_tax_should_save: number;
  total_tax_actually_saved: number;
  updated_at: string;
}

// Pending move with additional context
export interface PendingMoveWithContext extends RecommendedMove {
  source: string;
  date: string;
}

// Calculation result from lib/calculations.ts
export interface CalculationResult {
  tax: number;
  retirement: number;
  safeToSpend: number;
}

// Plaid balance response
export interface PlaidBalanceResponse {
  total_balance: number;
  available_balance?: number;
  accounts?: {
    name: string;
    balance: number;
    type: string;
  }[];
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}
