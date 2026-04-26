# Portfolio Engine (ak18-portfolio-main)

A high-performance, AI-powered portfolio management and financial intelligence platform. Track your investments, analyze risk, and get data-driven insights using state-of-the-art LLMs.

## 🚀 Features

- **Real-time Portfolio Tracking**: Monitor holdings, P&L, and current market value.
- **AI Portfolio Intelligence**: Chat with an AI analyst grounded in your live portfolio data (Gemini & LLaMA integration).
- **Tax Planning**: Calculate realized and unrealized gains for smarter tax management.
- **Exposure Analysis**: Visualize concentration risk by Geography, Sector, and Asset Category.
- **Investment Deployment**: Strategy tools to help deploy idle cash into the market.
- **Privacy Mode**: One-click toggle to hide sensitive financial values.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI.
- **Backend**: Supabase (Postgres, Edge Functions).
- **State Management**: TanStack Query (React Query).
- **AI Integration**: Custom Edge Functions via Lovable AI Gateway (Gemini 2.5 Flash) and Groq (LLaMA 3.1).

## 📂 Project Structure

- `src/pages`: Main application views (Dashboard, Taxes, AI, etc.)
- `src/components`: Modular UI building blocks.
- `src/hooks`: Business logic and data fetching (e.g., `usePortfolio`).
- `supabase/functions`: Serverless logic for AI, price fetching, and fundamental analysis.

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```

2. **Environment Setup**:
   Configure your `.env` file with Supabase and AI API keys.

3. **Run Locally**:
   ```bash
   bun dev
   # or
   npm run dev
   ```

4. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy portfolio-ai
   ```
