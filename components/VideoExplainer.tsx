"use client";

import React, { useState } from "react";
import { Play, X, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoExplainerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const VideoExplainer: React.FC<VideoExplainerProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      time: 0,
      title: "Welcome to SpendSafe",
      description: "Your financial copilot for 1099 income.",
      icon: "💰",
    },
    {
      time: 25,
      title: "Track Every Dollar",
      description: "Log income manually or connect your bank with Plaid.",
      icon: "📊",
    },
    {
      time: 50,
      title: "Automatic Tax Math",
      description:
        "We calculate exactly how much to set aside for taxes & retirement.",
      icon: "🧮",
    },
    {
      time: 75,
      title: "Stay Audit-Ready",
      description: "Export your data anytime. Be prepared for tax season.",
      icon: "🛡️",
    },
  ];

  const currentStep = steps.reduce((acc, step) => {
    if (progress >= step.time) return step;
    return acc;
  }, steps[0]);

  const handleSkip = () => {
    onComplete?.();
    onClose();
  };

  const simulatePlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          onComplete?.();
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      {/* Close Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"
        aria-label="Close video explainer"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Video Player Area */}
      <div className="w-full max-w-lg space-y-8">
        {/* Fake Video Screen */}
        <div className="aspect-video bg-gradient-to-br from-indigo-600 to-indigo-950 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-indigo-300 rounded-full blur-3xl animate-pulse delay-500" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center z-10">
            <div className="text-6xl mb-4 animate-bounce">
              {currentStep.icon}
            </div>
            <h2 className="text-2xl font-black mb-2">{currentStep.title}</h2>
            <p className="text-sm text-indigo-200 font-medium">
              {currentStep.description}
            </p>
          </div>

          {/* Play Button Overlay */}
          {!isPlaying && progress === 0 && (
            <button
              onClick={simulatePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all group"
              aria-label="Play video"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-indigo-600 ml-1" />
              </div>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
            {steps.map((step, i) => (
              <span
                key={i}
                className={progress >= step.time ? "text-white" : ""}
              >
                {step.title.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>

          <button
            onClick={isPlaying ? () => setIsPlaying(false) : simulatePlay}
            className="px-8 py-4 bg-white text-indigo-950 font-black rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" /> Pause
              </>
            ) : progress === 100 ? (
              "Get Started →"
            ) : (
              <>
                <Play className="w-5 h-5" />{" "}
                {progress > 0 ? "Resume" : "Watch Now"}
              </>
            )}
          </button>
        </div>

        {/* Skip Link */}
        <button
          onClick={handleSkip}
          className="w-full text-center text-xs font-black text-white/30 uppercase tracking-widest hover:text-white/60 transition-colors"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
};
