
import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, TrendingUp, ExternalLink, Search } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AiCopilotProps {
  safeToSpend: number;
  taxLiabilities: number;
  savingsTotal: number;
}

export const AiCopilot: React.FC<AiCopilotProps> = ({ safeToSpend, taxLiabilities, savingsTotal }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [source, setSource] = useState<{title: string, uri: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      // Using search grounding for the most up-to-date tax info
      const prompt = `Act as a 1099 Tax Wealth Copilot. 
      The user has $${safeToSpend} safe to spend and $${taxLiabilities} in unpaid taxes.
      
      Check for any upcoming US Federal estimated tax deadlines or tax news for freelancers for 2024/2025.
      Provide a one-sentence tip combining their personal balance with current tax reality. 
      Keep it encouraging.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}]
        }
      });

      setInsight(response.text || "Your financial path is looking clear today!");
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && chunks.length > 0) {
        const firstSearch = chunks.find(c => c.web);
        if (firstSearch) setSource({ title: firstSearch.web.title, uri: firstSearch.web.uri });
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      setInsight("Keep building that 1099 wealth! Your safe-to-spend balance is your North Star.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsight();
  }, [safeToSpend, taxLiabilities]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-white border border-indigo-100 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-start gap-4 relative z-10">
        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100/50">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Copilot Engine</h4>
            {source && (
               <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                 <Search className="w-2 h-2" /> Verify Source
               </a>
            )}
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 text-xs py-1 font-medium">
              <Loader2 className="w-3 h-3 animate-spin" /> Grounding financial data...
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-700 leading-relaxed font-bold">
                {insight}
              </p>
              {source && (
                <div className="bg-white p-2 rounded-xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all">
                  <p className="text-[9px] text-gray-400 font-bold truncate pr-4">{source.title}</p>
                  <ExternalLink className="w-2.5 h-2.5 text-gray-300 group-hover:text-indigo-500" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="absolute -bottom-6 -right-6 text-indigo-50/50">
        <TrendingUp size={120} />
      </div>
    </div>
  );
};
