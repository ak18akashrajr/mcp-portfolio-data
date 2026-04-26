import type { PortfolioSummary } from '@/types/portfolio';
import { usePrivacy } from '@/contexts/PrivacyContext';

function fmtRaw(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

interface Props {
  summary: PortfolioSummary;
}

export function SummaryBar({ summary }: Props) {
  const { mask } = usePrivacy();

  const fmt = (n: number) => mask(fmtRaw(n));

  const items = [
    { label: 'Total Net Worth', value: fmt(summary.totalPortfolioValue) },
    { label: 'Invested', value: fmt(summary.investedValue) },
    { label: 'Current', value: fmt(summary.currentValue) },
    {
      label: 'P&L',
      value: `${fmt(summary.totalPnl)} (${summary.totalPnlPercent.toFixed(2)}%)`,
      color: summary.totalPnl >= 0 ? 'text-gain' : 'text-loss',
    },
    {
      label: 'XIRR',
      value: summary.xirr != null ? `${(summary.xirr * 100).toFixed(2)}%` : '—',
      color: summary.xirr != null ? (summary.xirr >= 0 ? 'text-gain' : 'text-loss') : undefined,
    },
    { label: 'Liquid Cash', value: fmt(summary.liquidCash) },
    { label: 'Vault Cash', value: fmt(summary.vaultCash) },
    
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className={`text-sm font-semibold mt-1 ${item.color || 'text-foreground'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
