import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { supabase } from '@/lib/supabase';

const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
            'PLAID-SECRET': process.env.PLAID_SECRET!,
        },
    },
});

const plaidClient = new PlaidApi(configuration);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { webhook_type, webhook_code, item_id } = body;

        console.log('Plaid webhook received:', { webhook_type, webhook_code, item_id });

        // Handle transaction updates
        if (webhook_type === 'TRANSACTIONS') {
            if (webhook_code === 'INITIAL_UPDATE' || webhook_code === 'HISTORICAL_UPDATE' || webhook_code === 'DEFAULT_UPDATE') {
                // Get the access token for this item
                const { data: plaidItem } = await supabase
                    .from('plaid_items')
                    .select('access_token, user_id')
                    .eq('item_id', item_id)
                    .single();

                if (!plaidItem) {
                    console.error('Plaid item not found:', item_id);
                    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
                }

                // Fetch new transactions
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

                const transactionsResponse = await plaidClient.transactionsGet({
                    access_token: plaidItem.access_token,
                    start_date: thirtyDaysAgo.toISOString().split('T')[0],
                    end_date: now.toISOString().split('T')[0],
                });

                const transactions = transactionsResponse.data.transactions;

                // Filter for potential income (positive amounts, specific categories)
                const potentialIncome = transactions.filter((txn) => {
                    return (
                        txn.amount < 0 && // Negative in Plaid means money IN
                        Math.abs(txn.amount) >= 100 && // Minimum threshold
                        !txn.category?.includes('Transfer') // Exclude transfers
                    );
                });

                // Insert potential income events for user confirmation
                for (const txn of potentialIncome) {
                    const { error } = await supabase
                        .from('income_events')
                        .insert({
                            user_id: plaidItem.user_id,
                            source: 'plaid',
                            amount: Math.abs(txn.amount),
                            description: txn.name,
                            detected_at: txn.date,
                            plaid_transaction_id: txn.transaction_id,
                            user_confirmed: false, // Requires user confirmation
                            status: 'pending_confirmation',
                        })
                        .select()
                        .single();

                    if (error && error.code !== '23505') { // Ignore duplicate key errors
                        console.error('Error inserting income event:', error);
                    }
                }

                console.log(`Processed ${potentialIncome.length} potential income transactions`);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: error.message || 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
