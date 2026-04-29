import type { Transaction } from '@/types/portfolio';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { usePrivacy } from '@/contexts/PrivacyContext';

function fmtRaw(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface Props {
  transactions: Transaction[];
}

export function RecentActivity({ transactions }: Props) {
  const { mask } = usePrivacy();
  const fmt = (n: number) => mask(fmtRaw(n));

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const recent = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (recent.length === 0) return null;

  return (
    <div className="flex flex-col">
      {recent.map(t => (
        <div key={t.id} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0 group">
          <div className="flex items-center gap-3">
            <div className={`mt-0.5 ${t.type === 'BUY' ? 'text-gain' : 'text-loss'}`}>
              {t.type === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-bold text-sm text-foreground group-hover:text-[#d96c4d] transition-colors">{t.symbol}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t.type} · {formatDate(t.date)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{fmt(t.quantity * t.price)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t.quantity} × {fmt(t.price)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
