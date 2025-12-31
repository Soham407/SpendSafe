import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { NotificationService } from '@/lib/notifications';
import { createClient } from '@supabase/supabase-js';

// Native supabase client for server-side cron
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Needs service role for iterating all users
);

export async function GET(request: NextRequest) {
    // Check auth header for cron security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // 1. Get all active users
        const { data: users } = await supabaseAdmin.from('profiles').select('*');

        if (!users) return NextResponse.json({ message: 'No users found' });

        for (const user of users) {
            // 2. Get pending actions for this user
            const { data: pendingEvents } = await supabaseAdmin
                .from('income_events')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'pending_action');

            if (!pendingEvents || pendingEvents.length === 0) continue;

            const totalPending = pendingEvents.reduce((acc: number, e: any) => acc + Number(e.amount), 0);

            // Calculate Safe to Spend (simplified for digest)
            // In a real app, we'd fetch balance too
            const { data: summary } = await supabaseAdmin
                .from('yearly_summaries')
                .select('*')
                .eq('user_id', user.id)
                .eq('year', new Date().getFullYear())
                .single();

            // 3. Send Digest
            const subject = `📊 Your Weekly SpendSafe Snapshot`;
            const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h1 style="font-size: 20px;">Your Weekly Snapshot</h1>
          <div style="background: #f8fafc; padding: 20px; border-radius: 16px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Pending Action</p>
            <p style="margin: 0; font-size: 24px; font-weight: 900; color: #f59e0b;">${formatCurrency(totalPending)}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">You have ${pendingEvents.length} payments waiting for reconciliation.</p>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/history" style="display: block; text-align: center; background: #4f46e5; color: white; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: bold;">View Details</a>
        </div>
      `;

            await NotificationService.sendEmail(user.id, user.email, subject, html);
        }

        return NextResponse.json({ success: true, processed: users.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
