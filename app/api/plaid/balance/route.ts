import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { plaidClient } from '@/lib/plaid';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');

        if (!user_id) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        // 1. Get all Plaid items for this user
        const { data: plaidItems, error: itemsError } = await supabase
            .from('plaid_items')
            .select('access_token, item_id, institution_name')
            .eq('user_id', user_id);

        if (itemsError) throw itemsError;

        if (!plaidItems || plaidItems.length === 0) {
            return NextResponse.json({
                total_balance: 0,
                accounts: [],
                message: 'No bank accounts connected'
            });
        }

        let totalBalance = 0;
        const allAccounts: any[] = [];

        // 2. Fetch balance for each item
        // In a real production app, you might want to cache this or use a more efficient sync method
        const balancePromises = plaidItems.map(async (item: any) => {
            try {
                const balanceResponse = await plaidClient.accountsBalanceGet({
                    access_token: item.access_token,
                });

                const accounts = balanceResponse.data.accounts;

                accounts.forEach(account => {
                    const balance = account.balances.available ?? account.balances.current ?? 0;

                    // Only count depository (checking/savings) accounts for Safe to Spend
                    if (account.type === 'depository') {
                        totalBalance += balance;
                    }

                    allAccounts.push({
                        id: account.account_id,
                        name: account.name,
                        mask: account.mask,
                        type: account.type,
                        subtype: account.subtype,
                        balance: balance,
                        institution_name: item.institution_name,
                    });
                });
            } catch (err) {
                console.error(`Error fetching balance for item ${item.item_id}:`, err);
            }
        });

        await Promise.all(balancePromises);

        return NextResponse.json({
            total_balance: totalBalance,
            accounts: allAccounts,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Balance API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch bank balances' },
            { status: 500 }
        );
    }
}
