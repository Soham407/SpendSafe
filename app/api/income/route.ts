import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateSafetyMoves } from '@/lib/calculations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, amount, description, tax_rate, retirement_rate } = body;

        if (!user_id || !amount) {
            return NextResponse.json(
                { error: 'user_id and amount are required' },
                { status: 400 }
            );
        }

        // Insert income event
        const { data: incomeEvent, error: incomeError } = await supabase
            .from('income_events')
            .insert({
                user_id,
                source: 'manual',
                amount,
                description,
                user_confirmed: true,
                status: 'pending_action',
            })
            .select()
            .single();

        if (incomeError) {
            throw incomeError;
        }

        // Calculate recommended moves
        const moves = calculateSafetyMoves(amount, tax_rate || 30, retirement_rate || 10);

        // Insert recommended moves
        const recommendedMoves = [
            {
                income_event_id: incomeEvent.id,
                bucket_name: 'Tax',
                amount_to_move: moves.tax,
            },
            {
                income_event_id: incomeEvent.id,
                bucket_name: 'Retirement',
                amount_to_move: moves.retirement,
            },
        ];

        const { error: movesError } = await supabase
            .from('recommended_moves')
            .insert(recommendedMoves);

        if (movesError) {
            throw movesError;
        }

        return NextResponse.json({
            success: true,
            income_event: incomeEvent,
            recommended: moves,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

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

        const { data, error } = await supabase
            .from('income_events')
            .select(`
        *,
        recommended_moves (*)
      `)
            .eq('user_id', user_id)
            .order('detected_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ income_events: data });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
