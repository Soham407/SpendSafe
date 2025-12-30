import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateSafetyMoves } from '@/lib/calculations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { income_event_id, user_id, confirmed } = body;

        if (!income_event_id || !user_id || confirmed === undefined) {
            return NextResponse.json(
                { error: 'income_event_id, user_id, and confirmed are required' },
                { status: 400 }
            );
        }

        if (!confirmed) {
            // User rejected this as income - mark as dismissed
            const { error } = await supabase
                .from('income_events')
                .update({ status: 'dismissed', user_confirmed: false })
                .eq('id', income_event_id)
                .eq('user_id', user_id);

            if (error) throw error;

            return NextResponse.json({ success: true, action: 'dismissed' });
        }

        // User confirmed this is income
        // Get the income event details
        const { data: incomeEvent, error: fetchError } = await supabase
            .from('income_events')
            .select('amount')
            .eq('id', income_event_id)
            .single();

        if (fetchError) throw fetchError;

        // Get user's tax and retirement rates
        const { data: profile } = await supabase
            .from('profiles')
            .select('tax_rate_percentage, retirement_rate_percentage')
            .eq('id', user_id)
            .single();

        const taxRate = (profile?.tax_rate_percentage || 0.30) * 100;
        const retirementRate = (profile?.retirement_rate_percentage || 0.10) * 100;

        // Calculate recommended moves
        const moves = calculateSafetyMoves(incomeEvent.amount, taxRate, retirementRate);

        // Update income event status
        const { error: updateError } = await supabase
            .from('income_events')
            .update({
                status: 'pending_action',
                user_confirmed: true,
            })
            .eq('id', income_event_id);

        if (updateError) throw updateError;

        // Create recommended moves
        const recommendedMoves = [
            {
                income_event_id,
                bucket_name: 'Tax',
                amount_to_move: moves.tax,
            },
            {
                income_event_id,
                bucket_name: 'Retirement',
                amount_to_move: moves.retirement,
            },
        ];

        const { error: movesError } = await supabase
            .from('recommended_moves')
            .insert(recommendedMoves);

        if (movesError) throw movesError;

        return NextResponse.json({
            success: true,
            action: 'confirmed',
            moves,
        });
    } catch (error: any) {
        console.error('Error confirming income:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to confirm income' },
            { status: 500 }
        );
    }
}
