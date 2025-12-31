"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

interface SecuritySetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userEmail?: string;
}

// Generate a random base32 secret for demo purposes
// In production, this should come from the backend
function generateDemoSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export const SecuritySetup: React.FC<SecuritySetupProps> = ({
  isOpen,
  onClose,
  onComplete,
  userEmail = "user@example.com",
}) => {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [secret, setSecret] = useState<string>("");
  const [codeInputs, setCodeInputs] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [error, setError] = useState<string>("");

  // Generate a new secret when the modal opens
  useEffect(() => {
    if (isOpen) {
      setSecret(generateDemoSecret());
      setStep(1);
      setCodeInputs(["", "", "", "", "", ""]);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newInputs = [...codeInputs];
    newInputs[index] = value;
    setCodeInputs(newInputs);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    const code = codeInputs.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    // In demo mode, accept any 6-digit code
    // In production, validate against the actual TOTP
    if (!/^\d{6}$/.test(code)) {
      setError("Code must be 6 digits");
      return;
    }

    // Demo: Accept any valid 6-digit code
    onComplete();
  };

  const otpauthUrl = `otpauth://totp/SpendSafe:${encodeURIComponent(
    userEmail
  )}?secret=${secret}&issuer=SpendSafe`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    otpauthUrl
  )}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="text-center mb-6">
          <div className="bg-indigo-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-100">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-black text-gray-900">
            Secure Your Wealth
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-medium italic">
            Protect your financial data with 2FA
          </p>
        </div>

        {/* Demo Mode Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-6 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 font-medium">
            <strong>Demo Mode:</strong> This is a simulation. In production,
            secrets would be generated server-side and codes verified via TOTP.
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">
                  1
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  Download Google Authenticator or Authy on your phone.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">
                  2
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  Scan this code or copy the secret key below.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center">
              <div className="bg-white p-2 rounded-xl mb-4 shadow-sm">
                {/* Using img tag for QR code instead of background image */}
                <img
                  src={qrCodeUrl}
                  alt="2FA QR Code"
                  className="w-32 h-32"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-100 w-full">
                <code className="text-[10px] font-mono font-bold text-gray-500 flex-1 select-all">
                  {secret}
                </code>
                <button
                  onClick={handleCopy}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  title="Copy secret"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              I've Scanned It
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <p className="text-xs text-center text-gray-500 font-medium">
              Enter the 6-digit code from your authenticator app.
            </p>
            <div className="flex justify-between gap-2">
              {codeInputs.map((value, i) => (
                <input
                  key={i}
                  id={`code-input-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) =>
                    handleCodeChange(i, e.target.value.replace(/\D/g, ""))
                  }
                  className={`w-10 h-12 bg-gray-50 border rounded-xl text-center text-xl font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    error ? "border-red-300" : "border-gray-100"
                  }`}
                  placeholder="•"
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center font-medium">
                {error}
              </p>
            )}

            <p className="text-[10px] text-gray-400 text-center italic">
              Demo: Enter any 6 digits to simulate verification
            </p>

            <button
              onClick={handleVerify}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Verify & Enable <ShieldCheck className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
