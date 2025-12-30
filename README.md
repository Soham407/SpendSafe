# SpendSafe: The 1099 Wealth Builder 💰

**SpendSafe** is a premium, mobile-first "Financial Copilot" designed specifically for U.S. freelancers, contractors, and the 1099 workforce. Unlike traditional banking apps that only show you what you *have*, SpendSafe calculates what you can actually *spend* after accounting for taxes and retirement.

> **Our Philosophy:** We do the math; You move the cash.

---

## 🚀 Key Features

### 🏦 The "Safe to Spend" Hero Metric
Stop guessing how much of that client deposit is actually yours. SpendSafe automatically subtracts your tax liabilities (default 30%) and retirement goals (default 10%) from your balance to give you a single, addictive number you can trust.

### 🚨 The Panic Button (Audit Readiness)
A real-time widget that answers the terrifying question: *"If I got audited today, would I have enough?"* It calculates your total income vs. your actual savings to show you exactly how big your "Tax Gap" is.

### 🤖 AI & Voice Copilots
Powered by **Google Gemini**, our financial copilots provide context-aware insights. 
- **AI Copilot:** Analyzes your savings progress and nudges you to stay on track.
- **Voice Copilot:** Real-time audio interaction to ask questions about your financial safety net while you're on the go.

### 🔍 Automated Income Detection (Plaid)
Synced with your bank accounts via Plaid to monitor deposits. When it detects a payment, it flags it as "Potential Income" and waits for your one-tap confirmation to calculate the required moves.

### 🏆 Behavioral Loop & Gamification
- **Shame Reports:** A high-priority "Internal Audit" warning that triggers if your un-moved liabilities exceed $2,000.
- **Micro-Animations:** Confetti celebrations and premium glassmorphism UI to turn the chore of tax-saving into a dopamine-driven habit.
- **Badges:** Unlock achievements like "Tax Ninja" and "Golden Saver" as you build consistent saving habits.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom Premium Design System)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Banking API:** [Plaid](https://plaid.com/)
- **AI Engine:** [Google Gemini API](https://ai.google.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** Canvas-Confetti & CSS Glassmorphism

---

## 🛡️ Security & Privacy

SpendSafe is **Read-Only by design**.
- **Least Privilege:** We never see your bank credentials and have physically NO ability to withdraw or move funds.
- **Data Privacy:** We use your transaction data solely to calculate estimates. We do not sell your data.
- **Trust Center:** Built-in transparency portal to explain exactly how your data is handled.

---

## 🚦 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/Soham407/SpendSafe.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Setup Environment Variables:**
   Create a `.env.local` file with your credentials for:
   - Supabase (URL, Anon Key)
   - Plaid (Client ID, Secret)
   - Gemini (API Key)
4. **Run the dev server:**
   ```bash
   npm run dev
   ```

---

*Disclaimer: SpendSafe provides educational estimates based on user inputs. This is not tax, legal, or financial advice. Consult a CPA for personalized guidance.*
