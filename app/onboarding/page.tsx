"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ArrowRight,
  Calculator,
  TrendingUp,
  ChevronRight,
  Landmark,
  Loader2,
  X,
  Play,
} from "lucide-react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { PlaidLink } from "@/components/PlaidLink";
import { VideoExplainer } from "@/components/VideoExplainer";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [showPlaid, setShowPlaid] = useState(false);
  const [showVideo, setShowVideo] = useState(true); // Show video first
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        // Check if already onboarded (has bank connected)
        const { data: profile } = await supabase
          .from("profiles")
          .select("plaid_access_token")
          .eq("id", session.user.id)
          .single();

        if (profile?.plaid_access_token) {
          router.push("/");
        }
      }
      setLoading(false);
    };
    checkUser();
  }, [supabase, router]);

  const steps = [
    {
      icon: <Calculator className="w-12 h-12 text-indigo-600" />,
      title: "Taxes aren't a surprise anymore.",
      description:
        "Freelancers lose thousands in penalties. We calculate your 1099 liabilities in real-time as you get paid.",
      color: "bg-indigo-50",
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-emerald-600" />,
      title: "The 'Safe to Spend' Number.",
      description:
        "Stop guessing. We subtract your future taxes from your current balance so you know exactly what's yours to keep.",
      color: "bg-emerald-50",
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
      title: "Enterprise-Grade Security.",
      description:
        "Read-only access via Plaid. We can't move your money. Your bank credentials never touch our servers.",
      color: "bg-blue-50",
    },
  ];

  const current = steps[step];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Show video explainer first for new users
  if (showVideo) {
    return (
      <VideoExplainer
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        onComplete={() => setShowVideo(false)}
      />
    );
  }

  if (showPlaid) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-400">Secure Bank Link</span>
          </div>
          <button
            onClick={() => setShowPlaid(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900">
              Connect your bank
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              Link your primary business account to start tracking income
              automatically.
            </p>
          </div>

          {user && (
            <PlaidLink userId={user.id} onSuccess={() => router.push("/")} />
          )}

          <button
            onClick={() => router.push("/")}
            className="text-xs font-black text-gray-300 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            I'll do this later
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 bg-white text-center animate-in fade-in duration-700">
      <div className="w-full flex justify-end">
        <button
          onClick={() => router.push("/")}
          className="text-xs font-black text-gray-300 uppercase tracking-widest hover:text-indigo-600 transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 w-full max-w-sm">
        <div
          className={`${current.color} w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-gray-100 transition-all duration-500`}
        >
          {current.icon}
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight transition-all">
            {current.title}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            {current.description}
          </p>
        </div>

        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-indigo-600" : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="w-full bg-gray-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Next <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setShowPlaid(true)}
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Connect Business Bank <ArrowRight className="w-5 h-5" />
          </button>
        )}

        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
          Join 5,000+ Smart Freelancers
        </p>
      </div>
    </div>
  );
}
