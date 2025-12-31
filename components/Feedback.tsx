import React, { useState } from "react";
import { X, Heart, Smile, Meh, Frown, CheckCircle2 } from "lucide-react";

interface FeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const Feedback: React.FC<FeedbackProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFeedback = async (sentiment: string) => {
    setLoading(true);
    try {
      if (userId) {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            sentiment,
            page_url: window.location.pathname,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitted(true);
      setLoading(false);
      setTimeout(onClose, 2000);
    }
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm z-[150] animate-in slide-in-from-bottom duration-500">
      <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 p-6 rounded-[2.5rem] shadow-2xl text-center">
        {submitted ? (
          <div className="space-y-3 animate-in fade-in duration-500">
            <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">
              Thanks for the input!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Was this easy?
              </h4>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-300" />
              </button>
            </div>
            <div className="flex justify-center gap-4">
              {[
                {
                  icon: <Heart className="w-6 h-6 text-red-500" />,
                  label: "Love",
                },
                {
                  icon: <Smile className="w-6 h-6 text-emerald-500" />,
                  label: "Easy",
                },
                {
                  icon: <Meh className="w-6 h-6 text-gray-400" />,
                  label: "Okay",
                },
                {
                  icon: <Frown className="w-6 h-6 text-red-400" />,
                  label: "Hard",
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleFeedback(item.label)}
                  className="p-3 bg-gray-50 rounded-2xl hover:bg-indigo-50 hover:scale-110 active:scale-95 transition-all group"
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-gray-300 font-bold italic">
              Building the Bootstrapper Edition v1.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
