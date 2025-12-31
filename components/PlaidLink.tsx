"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2, Link as LinkIcon, CheckCircle2, AlertCircle, Building2, RefreshCw } from 'lucide-react';

interface PlaidLinkProps {
  userId: string;
  onSuccess?: () => void;
}

interface ConnectedBank {
  institution_name: string;
  accounts_count: number;
  connected_at: string;
}

export function PlaidLink({ userId, onSuccess }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<string>('sandbox');
  const [connectedBanks, setConnectedBanks] = useState<ConnectedBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // Fetch connected banks on mount
  useEffect(() => {
    const fetchConnectedBanks = async () => {
      try {
        const response = await fetch(`/api/plaid/connections?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setConnectedBanks(data.connections || []);
        }
      } catch (err) {
        console.error('Error fetching connections:', err);
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchConnectedBanks();
  }, [userId]);

  // Fetch link token from our API
  const createLinkToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setLinkToken(data.link_token);
      setEnvironment(data.environment || 'sandbox');
    } catch (err: any) {
      console.error('Error creating link token:', err);
      setError(err.message || 'Failed to initialize bank connection');
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

      const data = await response.json();
      
      if (response.ok) {
        // Add to connected banks list
        setConnectedBanks(prev => [...prev, {
          institution_name: metadata.institution?.name || 'Bank',
          accounts_count: metadata.accounts?.length || 0,
          connected_at: new Date().toISOString(),
        }]);
        setLinkToken(null);
        onSuccess?.();
      } else {
        setError(data.error || 'Failed to connect bank');
      }
    } catch (err: any) {
      console.error('Error exchanging token:', err);
      setError(err.message || 'Connection failed');
    }
  }, [userId, onSuccess]);

  const onPlaidExit = useCallback((err: any) => {
    setLinkToken(null);
    if (err) {
      setError(err.display_message || 'Connection cancelled');
    }
  }, []);

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  };

  const { open, ready } = usePlaidLink(config);

  // Auto-open when ready
  useEffect(() => {
    if (ready && linkToken) {
      open();
    }
  }, [ready, linkToken, open]);

  return (
    <div className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
          <LinkIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-black text-gray-900">Connect Your Bank</h3>
          <p className="text-xs text-gray-400 font-medium">Automatically detect income payments</p>
        </div>
      </div>

      {/* Environment Badge */}
      {environment !== 'production' && (
        <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-amber-700">
            {environment.toUpperCase()} MODE - Using test credentials
          </span>
        </div>
      )}

      {/* Connected Banks */}
      {connectedBanks.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connected Banks</p>
          {connectedBanks.map((bank, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-emerald-800 text-sm">{bank.institution_name}</p>
                  <p className="text-[10px] text-emerald-600">{bank.accounts_count} account(s) connected</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-red-700">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Security Info */}
      <div className="space-y-2 mb-4">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Read-only access to transactions
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Bank-level 256-bit encryption
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Revoke access anytime in settings
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={createLinkToken}
        disabled={loading || !!linkToken}
        className="w-full py-4 bg-indigo-600 text-white font-black rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Initializing...
          </>
        ) : linkToken ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Opening Plaid...
          </>
        ) : connectedBanks.length > 0 ? (
          <>
            <LinkIcon className="w-5 h-5" />
            Connect Another Bank
          </>
        ) : (
          <>
            <LinkIcon className="w-5 h-5" />
            Connect Bank Account
          </>
        )}
      </button>

      <p className="mt-4 text-[10px] text-gray-400 text-center font-medium">
        Powered by <span className="font-bold">Plaid</span>. We never see your bank password.
      </p>
    </div>
  );
}
