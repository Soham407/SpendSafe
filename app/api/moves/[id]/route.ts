import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { completion_method } = body;
        const moveId = params.id;

        if (!completion_method) {
            return NextResponse.json(
                { error: 'completion_method is required' },
                { status: 400 }
            );
        }

        const updateData: any = {
            completion_method,
        };

        if (completion_method === 'confirmed') {
            updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('recommended_moves')
            .update(updateData)
            .eq('id', moveId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // If confirmed, also update the parent income event status
        if (completion_method === 'confirmed' && data) {
            // Check if all moves for this income event are completed
            const { data: allMoves } = await supabase
                .from('recommended_moves')
                .select('*')
                .eq('income_event_id', data.income_event_id);

            const allCompleted = allMoves?.every((m: any) => m.completed_at !== null);

            if (allCompleted) {
                await supabase
                    .from('income_events')
                    .update({ status: 'completed' })
                    .eq('id', data.income_event_id);
            }
        }

        return NextResponse.json({ success: true, move: data });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
