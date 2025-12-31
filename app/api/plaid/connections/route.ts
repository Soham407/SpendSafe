import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

        // Fetch connected Plaid items with account counts
        const { data: items, error } = await supabase
            .from('plaid_items')
            .select(`
                id,
                item_id,
                institution_name,
                created_at,
                plaid_accounts (
                    id
                )
            `)
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        const connections = items?.map(item => ({
            id: item.id,
            item_id: item.item_id,
            institution_name: item.institution_name || 'Connected Bank',
            accounts_count: item.plaid_accounts?.length || 0,
            connected_at: item.created_at,
        })) || [];

        return NextResponse.json({
            connections,
            total: connections.length,
        });
    } catch (error: any) {
        console.error('Error fetching connections:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch connections' },
            { status: 500 }
        );
    }
}

// DELETE endpoint to remove a connection
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, item_id } = body;

        if (!user_id || !item_id) {
            return NextResponse.json(
                { error: 'user_id and item_id are required' },
                { status: 400 }
            );
        }

        // Delete the Plaid item (accounts will cascade delete)
        const { error } = await supabase
            .from('plaid_items')
            .delete()
            .eq('user_id', user_id)
            .eq('item_id', item_id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting connection:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete connection' },
            { status: 500 }
        );
    }
}
