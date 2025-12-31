import { Resend } from "resend";
import twilio from "twilio";
import { supabase } from "./supabase";

// Lazy initialization to avoid build-time errors
let resendClient: Resend | null = null;
let twilioClient: ReturnType<typeof twilio> | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getTwilioClient(): ReturnType<typeof twilio> | null {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // Twilio requires accountSid to start with 'AC'
  if (accountSid && accountSid.startsWith("AC") && authToken) {
    try {
      twilioClient = twilio(accountSid, authToken);
    } catch (error) {
      console.warn("Failed to initialize Twilio client:", error);
      return null;
    }
  }
  return twilioClient;
}

export const NotificationService = {
  async sendSMS(userId: string, phoneNumber: string, message: string) {
    const client = getTwilioClient();

    if (!client) {
      console.warn("Twilio not configured or invalid credentials");
      return { success: false, error: "Twilio not configured" };
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      console.warn("TWILIO_PHONE_NUMBER not set");
      return { success: false, error: "Twilio phone number not configured" };
    }

    try {
      const result = await client.messages.create({
        body: message,
        to: phoneNumber,
        from: twilioPhoneNumber,
      });

      await supabase.from("notifications").insert({
        user_id: userId,
        type: "sms",
        recipient: phoneNumber,
        content: message,
        status: "sent",
      });

      return { success: true, sid: result.sid };
    } catch (error: any) {
      console.error("SMS Error:", error);
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "sms",
        recipient: phoneNumber,
        content: message,
        status: "failed",
        error_message: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  async sendEmail(
    userId: string,
    email: string,
    subject: string,
    html: string
  ) {
    const client = getResendClient();

    if (!client) {
      console.warn("Resend not configured");
      return { success: false, error: "Resend not configured" };
    }

    try {
      const { data, error } = await client.emails.send({
        from: "SpendSafe <notifications@resend.dev>", // Update with your verified domain
        to: email,
        subject: subject,
        html: html,
      });

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: userId,
        type: "email",
        recipient: email,
        content: subject,
        status: "sent",
      });

      return { success: true, id: data?.id };
    } catch (error: any) {
      console.error("Email Error:", error);
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "email",
        recipient: email,
        content: subject,
        status: "failed",
        error_message: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  async nudgeIncomeAction(
    userId: string,
    amount: number,
    source: string,
    transactionId: string
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profile) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const confirmUrl = `${appUrl}/confirm/${transactionId}`;

    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

    const message = `💰 High Five! ${formattedAmount} from ${source} just landed. \n\nTap here to confirm your savings: ${confirmUrl}`;

    if (
      profile.notification_preference === "sms" ||
      profile.notification_preference === "both"
    ) {
      if (profile.phone_number) {
        await this.sendSMS(userId, profile.phone_number, message);
      }
    }

    if (
      profile.notification_preference === "email" ||
      profile.notification_preference === "both"
    ) {
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; max-width: 480px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 24px; padding: 32px; color: white; text-align: center;">
            <h1 style="font-size: 28px; margin: 0 0 8px 0;">💰 High Five!</h1>
            <p style="font-size: 18px; margin: 0; opacity: 0.9;">Payment Detected</p>
          </div>
          
          <div style="padding: 32px 0; text-align: center;">
            <p style="font-size: 32px; font-weight: 800; color: #111; margin: 0;">${formattedAmount}</p>
            <p style="font-size: 14px; color: #666; margin: 8px 0 0 0;">from ${source}</p>
          </div>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${confirmUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 16px 32px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 14px;">
              Confirm My Savings →
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            Your "Safe to Spend" will update instantly after confirmation.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          
          <p style="color: #999; font-size: 10px; text-align: center;">
            SpendSafe • Financial Copilot for Freelancers
          </p>
        </div>
      `;
      await this.sendEmail(
        userId,
        profile.email,
        `Payment Detected: ${source}`,
        html
      );
    }
  },

  // Check if notification services are configured
  getServiceStatus() {
    return {
      twilio: {
        configured: !!process.env.TWILIO_ACCOUNT_SID?.startsWith("AC"),
        hasPhoneNumber: !!process.env.TWILIO_PHONE_NUMBER,
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
      },
    };
  },
};
