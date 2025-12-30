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
        const { public_token, user_id, institution, accounts } = body;

        if (!public_token || !user_id) {
            return NextResponse.json(
                { error: 'public_token and user_id are required' },
                { status: 400 }
            );
        }

        // Exchange public token for access token
        const response = await plaidClient.itemPublicTokenExchange({
            public_token,
        });

        const access_token = response.data.access_token;
        const item_id = response.data.item_id;

        // Store access token in database (encrypted via Supabase RLS)
        const { error: dbError } = await supabase
            .from('plaid_items')
            .insert({
                user_id,
                item_id,
                access_token,
                institution_id: institution?.institution_id,
                institution_name: institution?.name,
            });

        if (dbError) {
            console.error('Database error:', dbError);
            throw dbError;
        }

        // Store connected accounts
        if (accounts && accounts.length > 0) {
            const accountRecords = accounts.map((account: any) => ({
                user_id,
                item_id,
                account_id: account.id,
                account_name: account.name,
                account_type: account.type,
                account_subtype: account.subtype,
            }));

            await supabase.from('plaid_accounts').insert(accountRecords);
        }

        return NextResponse.json({
            success: true,
            item_id,
            accounts_connected: accounts?.length || 0,
        });
    } catch (error: any) {
        console.error('Error exchanging token:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to exchange token' },
            { status: 500 }
        );
    }
}
