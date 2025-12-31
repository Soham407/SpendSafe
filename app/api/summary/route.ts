import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const year = searchParams.get('year') || new Date().getFullYear();

        if (!user_id) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        // Fetch or compute yearly summary
        let { data: summary, error } = await supabase
            .from('yearly_summaries')
            .select('*')
            .eq('user_id', user_id)
            .eq('year', year)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
        }

        if (!summary) {
            // Compute from income events
            const startOfYear = `${year}-01-01`;
            const endOfYear = `${year}-12-31`;

            const { data: incomeEvents } = await supabase
                .from('income_events')
                .select(`
          amount,
          recommended_moves (
            bucket_name,
            amount_to_move,
            completed_at
          )
        `)
                .eq('user_id', user_id)
                .gte('detected_at', startOfYear)
                .lte('detected_at', endOfYear);

            let totalIncome = 0;
            let totalTaxShouldSave = 0;
            let totalTaxActuallySaved = 0;

            incomeEvents?.forEach((event: any) => {
                totalIncome += Number(event.amount);
                event.recommended_moves?.forEach((move: any) => {
                    if (move.bucket_name === 'Tax') {
                        totalTaxShouldSave += Number(move.amount_to_move);
                        if (move.completed_at) {
                            totalTaxActuallySaved += Number(move.amount_to_move);
                        }
                    }
                });
            });

            summary = {
                user_id,
                year: Number(year),
                total_income: totalIncome,
                total_tax_should_save: totalTaxShouldSave,
                total_tax_actually_saved: totalTaxActuallySaved,
                updated_at: new Date().toISOString()
            };

            // Cache the summary for future use
            await supabase
                .from('yearly_summaries')
                .upsert(summary, { onConflict: 'user_id,year' });
        }

        const taxGap = (summary.total_tax_should_save || 0) - (summary.total_tax_actually_saved || 0);

        return NextResponse.json({
            ...summary,
            tax_gap: taxGap,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
