export type Profile = {
    id: string;
    email: string | null;
    tax_rate_percentage: number;
    retirement_rate_percentage: number;
    two_factor_enabled: boolean;
    plaid_access_token: string | null;
    notification_preference: 'sms' | 'email' | 'both';
    created_at: string;
};

export type IncomeEvent = {
    id: string;
    user_id: string;
    source: 'manual' | 'plaid';
    plaid_transaction_id: string | null;
    amount: number;
    description: string | null;
    detected_at: string;
    user_confirmed: boolean;
    status: 'pending_action' | 'completed' | 'dismissed';
    created_at: string;
};

export type RecommendedMove = {
    id: string;
    income_event_id: string;
    bucket_name: 'Tax' | 'Retirement';
    amount_to_move: number;
    completed_at: string | null;
    completion_method: 'confirmed' | 'postponed' | 'dismissed' | null;
    created_at: string;
};

export type YearlySummary = {
    id: string;
    user_id: string;
    year: number;
    total_income: number;
    total_tax_should_save: number;
    total_tax_actually_saved: number;
    updated_at: string;
};
