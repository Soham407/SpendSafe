import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { NotificationService } from "@/lib/notifications";
import { createClient } from "@supabase/supabase-js";

// Native supabase client for server-side cron
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Needs service role for iterating all users
);

export async function GET(request: NextRequest) {
  // Check auth header for cron security
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 1. Get all active users
    const { data: users } = await supabaseAdmin.from("profiles").select("*");

    if (!users) return NextResponse.json({ message: "No users found" });

    for (const user of users) {
      // 2. Get pending actions for this user
      const { data: pendingEvents } = await supabaseAdmin
        .from("income_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending_action");

      if (!pendingEvents || pendingEvents.length === 0) continue;

      const totalPending = pendingEvents.reduce(
        (acc: number, e: any) => acc + Number(e.amount),
        0
      );

      // Calculate Safe to Spend (simplified for digest)
      // In a real app, we'd fetch balance too
      const { data: summary } = await supabaseAdmin
        .from("yearly_summaries")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", new Date().getFullYear())
        .single();

      // 3. Send Digest
      const subject = `📊 Your Weekly SpendSafe Snapshot`;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; max-width: 480px; margin: 0 auto; background-color: #fcfcfd;">
          <div style="background: #4f46e5; border-radius: 24px; padding: 32px; color: white; text-align: center; margin-bottom: 24px;">
            <p style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; font-weight: 900; opacity: 0.7; margin: 0 0 8px 0;">Weekly Snapshot</p>
            <h1 style="font-size: 24px; margin: 0; font-weight: 900;">Staying On Track</h1>
          </div>

          <div style="background: white; border: 1px solid #eee; border-radius: 24px; padding: 24px; margin-bottom: 16px;">
            <p style="font-size: 10px; font-weight: 900; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Pending Action</p>
            <p style="font-size: 28px; font-weight: 900; color: #111; margin: 0;">${formatCurrency(
              totalPending
            )}</p>
            <p style="font-size: 13px; color: #666; margin: 8px 0 0 0;">${
              pendingEvents.length
            } payments waiting for reconciliation.</p>
          </div>

          ${
            summary
              ? `
          <div style="background: white; border: 1px solid #eee; border-radius: 24px; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 10px; font-weight: 900; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">YTD Audit Readiness</p>
            <p style="font-size: 28px; font-weight: 900; color: #111; margin: 0;">${
              Math.round(
                (Number(summary.total_tax_actually_saved) /
                  Number(summary.total_tax_should_save)) *
                  100
              ) || 0
            }%</p>
            <p style="font-size: 13px; color: #666; margin: 8px 0 0 0;">You've saved ${formatCurrency(
              summary.total_tax_actually_saved
            )} for taxes this year.</p>
          </div>
          `
              : ""
          }
          
          <div style="text-align: center;">
            <a href="${appUrl}/history" style="display: inline-block; background: #111; color: white; padding: 16px 32px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
              Finish Reconciliation →
            </a>
          </div>
          
          <p style="color: #999; font-size: 10px; text-align: center; margin-top: 48px;">
            SpendSafe • Financial Copilot for Freelancers
          </p>
        </div>
      `;

      await NotificationService.sendEmail(user.id, user.email, subject, html);
    }

    return NextResponse.json({ success: true, processed: users.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
