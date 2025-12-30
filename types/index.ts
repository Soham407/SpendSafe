
export type Status = 'pending_action' | 'reconciled' | 'ignored';

export interface UserSettings {
    tax_rate_percentage: number;
    retirement_rate_percentage: number;
    two_factor_enabled: boolean;
    bank_connected: boolean;
}

export interface IncomeEvent {
    id: string;
    amount: number;
    original_description: string;
    detected_at: string;
    status: Status;
}

export interface RecommendedMove {
    id: string;
    income_event_id: string;
    bucket_name: 'Tax' | 'Retirement';
    amount_to_move: number;
    is_completed: boolean;
}

export interface Vault {
    name: string;
    total_saved: number;
    target?: number;
}

export type Page = 'dashboard' | 'history' | 'settings' | 'vaults';
