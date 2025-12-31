import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for cleanup
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cleanup] Starting 90-day transaction description cleanup...');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Update income_events that are older than 90 days
    // We null out the description for privacy, but keep the amount for tax history
    const { data, error, count } = await supabaseAdmin
      .from('income_events')
      .update({ description: '[Redacted for Privacy]' })
      .lt('detected_at', ninetyDaysAgo.toISOString())
      .not('description', 'is', null) // Only update if description is not already null
      .select('id');

    if (error) {
      console.error('[Cleanup] Error during cleanup:', error);
      throw error;
    }

    console.log(`[Cleanup] Successfully redacted ${data?.length || 0} transaction descriptions older than 90 days.`);

    return NextResponse.json({
      success: true,
      processed_count: data?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Cleanup] Fatal error:', error);
    return NextResponse.json(
      { error: error.message || 'Cleanup failed' },
      { status: 500 }
    );
  }
}
