import type { DerivedHolding } from '@/types/portfolio';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { usePrivacy } from '@/contexts/PrivacyContext';

function fmtRaw(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

interface Props {
  gainers: DerivedHolding[];
  losers: DerivedHolding[];
}

function MoverCard({ holding, type }: { holding: DerivedHolding; type: 'gain' | 'loss' }) {
  const { mask } = usePrivacy();
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0 group">
      <div>
        <p className="font-bold text-sm text-foreground group-hover:text-[#d96c4d] transition-colors">{holding.symbol}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{mask(fmtRaw(holding.currentPrice))}</p>
      </div>
      <div className={`text-right flex items-center gap-1 ${type === 'gain' ? 'text-gain' : 'text-loss'}`}>
        {type === 'gain' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span className="text-sm font-bold">{holding.pnlPercent.toFixed(2)}%</span>
      </div>
    </div>
  );
}

export function TopMovers({ gainers, losers }: Props) {
  if (gainers.length === 0 && losers.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {gainers.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold text-gain tracking-[0.1em] uppercase mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Gainers
          </h3>
          <div className="flex flex-col">
            {gainers.map((h) => <MoverCard key={h.symbol} holding={h} type="gain" />)}
          </div>
        </div>
      )}
      {losers.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold text-loss tracking-[0.1em] uppercase mb-2 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" /> Losers
          </h3>
          <div className="flex flex-col">
            {losers.map((h) => <MoverCard key={h.symbol} holding={h} type="loss" />)}
          </div>
        </div>
      )}
    </div>
  );
}
