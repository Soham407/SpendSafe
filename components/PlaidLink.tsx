"use client";

import React, { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2, Link as LinkIcon } from 'lucide-react';

interface PlaidLinkProps {
  userId: string;
  onSuccess?: () => void;
}

export function PlaidLink({ userId, onSuccess }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch link token from our API
  const createLinkToken = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error creating link token:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Exchange public token for access token
  const onPlaidSuccess = useCallback(async (public_token: string, metadata: any) => {
    try {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_token,
          user_id: userId,
          institution: metadata.institution,
          accounts: metadata.accounts,
        }),
      });

      if (response.ok) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
    }
  }, [userId, onSuccess]);

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  // Auto-open when ready
  React.useEffect(() => {
    if (ready && linkToken) {
      open();
    }
  }, [ready, linkToken, open]);

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <LinkIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Connect Your Bank</h3>
          <p className="text-sm text-muted">Automatically detect income payments</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-muted/5 rounded-lg border border-border">
          <p className="text-xs text-muted mb-2">✓ Read-only access</p>
          <p className="text-xs text-muted mb-2">✓ Bank-level encryption</p>
          <p className="text-xs text-muted">✓ Revoke anytime</p>
        </div>

        <button
          onClick={createLinkToken}
          disabled={loading || !!linkToken}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : linkToken ? (
            'Opening Plaid...'
          ) : (
            <>
              <LinkIcon className="w-5 h-5" />
              Connect Bank Account
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-xs text-muted text-center">
        Powered by Plaid. We never see your bank password.
      </p>
    </div>
  );
}
