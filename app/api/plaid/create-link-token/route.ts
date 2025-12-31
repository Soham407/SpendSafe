import { NextRequest, NextResponse } from 'next/server';
import { Products, CountryCode } from 'plaid';
import { plaidClient, plaidEnvironment } from '@/lib/plaid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    console.log(`[Plaid] Creating link token in ${plaidEnvironment} mode`);

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user_id,
      },
      client_name: 'SpendSafe',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/plaid/webhook`,
      redirect_uri: process.env.PLAID_REDIRECT_URI,
    });

    return NextResponse.json({
      link_token: response.data.link_token,
      environment: plaidEnvironment,
    });
  } catch (error: any) {
    console.error('Error creating link token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create link token' },
      { status: 500 }
    );
  }
}
