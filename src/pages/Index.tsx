import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SummaryBar } from '@/components/SummaryBar';
import { HoldingsTable } from '@/components/HoldingsTable';
import { TopMovers } from '@/components/TopMovers';
import { RecentActivity } from '@/components/RecentActivity';
import { CashSection } from '@/components/CashSection';
import { AddTransactionForm } from '@/components/AddTransactionForm';
import { ExposureSection } from '@/components/ExposureSection';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePortfolio } from '@/hooks/usePortfolio';
import { RefreshCw, Eye, EyeOff, FileText, BarChart3, Crosshair, Target, Bot } from 'lucide-react';
import { PrivacyProvider, usePrivacy } from '@/contexts/PrivacyContext';
import { LoginGate } from '@/components/LoginGate';

const IndexContent = () => {
  const { hidden, toggle } = usePrivacy();

  const {
    transactions,
    holdings,
    summary,
    topMovers,
    exposure,
    cash,
    currentPrices,
    loading,
    fetchingPrices,
    lastPriceFetchTime,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateCash,
    updatePrice,
    updateSymbolMetadata,
    fetchLivePrices,
    averageSipThisFY,
  } = usePortfolio();

  const bumpRefresh = useCallback(() => {}, []);

  // Wrap transaction actions to trigger net worth recording
  const handleAddTransaction = useCallback(async (txn: any) => {
    await addTransaction(txn);
    bumpRefresh();
  }, [addTransaction, bumpRefresh]);

  const handleUpdateTransaction = useCallback(async (id: string, updates: any) => {
    await updateTransaction(id, updates);
    bumpRefresh();
  }, [updateTransaction, bumpRefresh]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    await deleteTransaction(id);
    bumpRefresh();
  }, [deleteTransaction, bumpRefresh]);

  const handleUpdateCash = useCallback(async (newCash: any) => {
    await updateCash(newCash);
    bumpRefresh();
  }, [updateCash, bumpRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <header className="mb-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-widest text-foreground">PORTFOLIO</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => { sessionStorage.removeItem('portfolio_auth'); window.location.reload(); }}
                className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-semibold text-sm"
                title="Logout"
              >
                U
              </button>
            </div>
          </div>

          {/* Secondary Nav Bar */}
          <div className="flex flex-col items-center justify-center space-y-4 py-4 border-b border-border/50">
            <p className="text-xs text-muted-foreground tracking-wider">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} - Portfolio Snapshot
            </p>
            <div className="flex items-center gap-6 overflow-x-auto w-full justify-center pb-2">
              {[
                { to: '/', label: 'Overview', active: true },
                { to: '/charts', label: 'Charts' },
                { to: '/taxes', label: 'Taxes' },
                { to: '/projections', label: 'Projections' },
                { to: '/deployment-plan', label: 'Deploy' },
                { to: '/ai', label: 'AI' },
                { to: '/rolling-return', label: 'Rolling' },
              ].map(({ to, label, active }) => (
                <Link
                  key={label}
                  to={to}
                  className={`text-sm font-medium transition-colors whitespace-nowrap px-1 pb-1 border-b-2 ${
                    active ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLivePrices}
              disabled={fetchingPrices || holdings.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground border border-border hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={lastPriceFetchTime ? `Last updated: ${lastPriceFetchTime}` : 'Fetch live prices'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingPrices ? 'animate-spin' : ''}`} />
              <span>{fetchingPrices ? 'Fetching…' : 'Sync Prices'}</span>
            </button>

            <button
              onClick={toggle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground border border-border hover:text-foreground hover:bg-accent transition-colors"
              title={hidden ? 'Show values' : 'Hide values'}
            >
              {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{hidden ? 'Hidden' : 'Visible'}</span>
            </button>
          </div>
          <AddTransactionForm onAdd={handleAddTransaction} />
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Top Movers & Recent Activity */}
          <div className="lg:col-span-3 space-y-10">
            <div>
              <h3 className="text-[11px] font-bold text-[#d96c4d] tracking-[0.2em] uppercase mb-5 border-b-2 border-[#d96c4d] inline-block pb-1">
                Today's Movers
              </h3>
              <TopMovers gainers={topMovers.gainers} losers={topMovers.losers} />
            </div>
            
            <div>
              <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase mb-5 border-b border-border pb-1">
                Recent Activity
              </h3>
              <RecentActivity transactions={transactions} />
            </div>
          </div>

          {/* Center Column: Summary & Holdings */}
          <div className="lg:col-span-6 space-y-10">
            {/* Featured Summary */}
            <div className="relative rounded-lg overflow-hidden bg-white dark:bg-card border border-border/50 shadow-sm">
              <div className="bg-[#d96c4d]/10 dark:bg-[#d96c4d]/20 px-6 py-8 border-b border-border/50">
                <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4 text-[#d96c4d]">Portfolio Summary</h2>
                <div className="mt-4">
                  <SummaryBar summary={summary} />
                </div>
              </div>
            </div>

            {/* Holdings List */}
              <div className="mb-8 p-4 rounded-lg bg-accent/30 border border-border/50 flex items-center justify-between">
                <div>
                  <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Average SIP (This FY)</h3>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(averageSipThisFY)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Monthly Average since April</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold tracking-tight text-foreground">Current Holdings</h3>
                <p className="text-xs text-muted-foreground mt-1">Derived from your transaction history</p>
              </div>
              <HoldingsTable
                holdings={holdings}
                onUpdatePrice={updatePrice}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onUpdateMetadata={updateSymbolMetadata}
              />
            </div>

          {/* Right Column: Exposure & Cash */}
          <div className="lg:col-span-3 space-y-10 lg:border-l lg:border-border/50 lg:pl-8">
            <div>
              <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase mb-5 border-b border-border pb-1">
                Exposure Profile
              </h3>
              <ExposureSection geography={exposure.geography} category={exposure.category} />
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] uppercase mb-5 border-b border-border pb-1">
                Cash Management
              </h3>
              <CashSection cash={cash} onUpdate={handleUpdateCash} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => (
  <LoginGate>
    <PrivacyProvider>
      <IndexContent />
    </PrivacyProvider>
  </LoginGate>
);

export default Index;
