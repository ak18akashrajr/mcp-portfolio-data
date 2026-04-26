import type { ExposureBreakdown } from '@/types/portfolio';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { getCategoryIcon } from '@/lib/categoryIcons';

function fmtRaw(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

interface Props {
  geography: ExposureBreakdown[];
  category: ExposureBreakdown[];
}

function ExposureBar({ items, colorClass, mask, showIcons }: { items: ExposureBreakdown[]; colorClass: string; mask: (v: string) => string; showIcons?: boolean }) {
  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">No data — tag your holdings with geography/category.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = showIcons ? getCategoryIcon(item.label) : null;
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground font-medium flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
                {item.label}
              </span>
              <span className="text-muted-foreground">{mask(fmtRaw(item.value))} ({item.percent.toFixed(1)}%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colorClass}`}
                style={{ width: `${Math.min(item.percent, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ExposureSection({ geography, category }: Props) {
  const { mask } = usePrivacy();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Geography Exposure</h3>
        <ExposureBar items={geography} colorClass="bg-primary" mask={mask} />
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Category Exposure</h3>
        <ExposureBar items={category} colorClass="bg-gain" mask={mask} showIcons />
      </div>
    </div>
  );
}
