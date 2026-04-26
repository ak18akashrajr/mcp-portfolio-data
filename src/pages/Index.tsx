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
        {/* Navbar */}
        <nav className="flex items-center justify-between border-b border-border pb-4">
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Portfolio Engine</h1>

          <div className="flex items-center gap-1">
            {[
              { to: '/charts', icon: BarChart3, label: 'Charts' },
              { to: '/taxes', icon: FileText, label: 'Taxes' },
              { to: '/projections', icon: Crosshair, label: 'Projections' },
              { to: '/deployment-plan', icon: Target, label: 'Deploy' },
              { to: '/ai', icon: Bot, label: 'AI' },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}

            <div className="w-px h-5 bg-border mx-1" />

            <button
              onClick={fetchLivePrices}
              disabled={fetchingPrices || holdings.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={lastPriceFetchTime ? `Last updated: ${lastPriceFetchTime}` : 'Fetch live prices'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingPrices ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{fetchingPrices ? 'Fetching…' : 'Prices'}</span>
            </button>

            <button
              onClick={toggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title={hidden ? 'Show values' : 'Hide values'}
            >
              {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            <ThemeToggle />

            <button
              onClick={() => { sessionStorage.removeItem('portfolio_auth'); window.location.reload(); }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Welcome */}
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-base font-medium text-foreground">
            Vanakkam Da Mapla! 😊
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Iniku Market Epdi Iruku nu Paklam Vaariya 📈
          </p>
        </div>

        {/* Summary */}
        <SummaryBar summary={summary} />


        {/* Add Transaction */}
        <AddTransactionForm onAdd={handleAddTransaction} />

        {/* Holdings */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Holdings (Derived from Transactions)</h2>
          <HoldingsTable
            holdings={holdings}
            onUpdatePrice={updatePrice}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateMetadata={updateSymbolMetadata}
          />
        </div>

        {/* Exposure */}
        <ExposureSection geography={exposure.geography} category={exposure.category} />

        {/* Recent Activity */}
        <RecentActivity transactions={transactions} />

        {/* Top Movers */}
        <TopMovers gainers={topMovers.gainers} losers={topMovers.losers} />

        {/* Cash */}
        <CashSection cash={cash} onUpdate={handleUpdateCash} />
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
