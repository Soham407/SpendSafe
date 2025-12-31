import { Resend } from 'resend';
import twilio from 'twilio';
import { supabase } from './supabase';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const NotificationService = {
  async sendSMS(userId: string, phoneNumber: string, message: string) {
    if (!twilioClient) {
      console.warn('Twilio not configured');
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const result = await twilioClient.messages.create({
        body: message,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      });

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'sms',
        recipient: phoneNumber,
        content: message,
        status: 'sent',
      });

      return { success: true, sid: result.sid };
    } catch (error: any) {
      console.error('SMS Error:', error);
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'sms',
        recipient: phoneNumber,
        content: message,
        status: 'failed',
        error_message: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  async sendEmail(userId: string, email: string, subject: string, html: string) {
    if (!resend) {
      console.warn('Resend not configured');
      return { success: false, error: 'Resend not configured' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'SpendSafe <notifications@resend.dev>', // Update with your verified domain
        to: email,
        subject: subject,
        html: html,
      });

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'email',
        recipient: email,
        content: subject,
        status: 'sent',
      });

      return { success: true, id: data?.id };
    } catch (error: any) {
      console.error('Email Error:', error);
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'email',
        recipient: email,
        content: subject,
        status: 'failed',
        error_message: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  async nudgeIncomeAction(userId: string, amount: number, source: string, transactionId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmUrl = `${appUrl}/confirm/${transactionId}`;
    
    const message = `💰 High Five! ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)} from ${source} just landed. \n\nTap here to confirm your savings: ${confirmUrl}`;

    if (profile.notification_preference === 'sms' || profile.notification_preference === 'both') {
      if (profile.phone_number) {
        await this.sendSMS(userId, profile.phone_number, message);
      }
    }

    if (profile.notification_preference === 'email' || profile.notification_preference === 'both') {
      const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h1 style="font-size: 24px;">💰 High Five!</h1>
          <p style="font-size: 16px;"><strong>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}</strong> from ${source} just landed.</p>
          <div style="margin: 30px 0;">
            <a href="${confirmUrl}" style="background: #4f46e5; color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: bold;">Confirm My Savings</a>
          </div>
          <p style="color: #666; font-size: 12px;">Your "Safe to Spend" will update instantly after confirmation.</p>
        </div>
      `;
      await this.sendEmail(userId, profile.email, `Payment Detected: ${source}`, html);
    }
  }
};
