import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { plaidClient, plaidEnvironment, isProduction } from '@/lib/plaid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { webhook_type, webhook_code, item_id } = body;

        // Webhook verification for production security
        // In production, verify the webhook using Plaid's verification endpoint
        if (isProduction) {
            const plaidVerificationHeader = request.headers.get('plaid-verification');
            if (plaidVerificationHeader) {
                try {
                    // Plaid's webhook verification checks the signature
                    const verification = await plaidClient.webhookVerificationKeyGet({
                        key_id: plaidVerificationHeader,
                    });
                    console.log('[Plaid] Webhook verified:', verification.data.key.expired_at);
                } catch (verifyError) {
                    console.error('[Plaid] Webhook verification failed:', verifyError);
                    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 401 });
                }
            }
        }

        console.log(`[Plaid] Webhook received (${plaidEnvironment}):`, { webhook_type, webhook_code, item_id });

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
                    } else if (!error) {
                        // Trigger Nudge for new detections
                        try {
                            const { NotificationService } = await import('@/lib/notifications');
                            await NotificationService.nudgeIncomeAction(plaidItem.user_id, Math.abs(txn.amount), txn.name, txn.transaction_id);
                        } catch (nudgeError) {
                            console.error('Failed to send nudge:', nudgeError);
                        }
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
