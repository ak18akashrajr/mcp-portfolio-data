import { useState } from 'react';
import type { CashSettings } from '@/types/portfolio';
import { Pencil, Check } from 'lucide-react';
import { usePrivacy } from '@/contexts/PrivacyContext';

function fmtRaw(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

interface Props {
  cash: CashSettings;
  onUpdate: (updates: Partial<CashSettings>) => void;
}

export function CashSection({ cash, onUpdate }: Props) {
  const { mask } = usePrivacy();
  const fmt = (n: number) => mask(fmtRaw(n));

  const [editing, setEditing] = useState<'liquid' | 'vault' | 'debt' | null>(null);
  const [inputVal, setInputVal] = useState('');

  const startEdit = (field: 'liquid' | 'vault' | 'debt') => {
    setEditing(field);
    if (field === 'liquid') setInputVal(cash.liquidCash.toString());
    else if (field === 'vault') setInputVal(cash.vaultCash.toString());
    else setInputVal(cash.debt.toString());
  };

  const save = () => {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val >= 0 && editing) {
      if (editing === 'liquid') onUpdate({ liquidCash: val });
      else if (editing === 'vault') onUpdate({ vaultCash: val });
      else onUpdate({ debt: val });
    }
    setEditing(null);
  };

  const items = [
    { key: 'liquid' as const, label: 'Liquid Cash', value: cash.liquidCash, color: 'text-foreground' },
    { key: 'vault' as const, label: 'Vault Cash (ICICI)', value: cash.vaultCash, color: 'text-foreground' },
    { key: 'debt' as const, label: 'Debt / Money I Owe', value: cash.debt, color: 'text-loss' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between p-3 rounded-md bg-white dark:bg-card border border-border/40">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{item.label}</p>
            {editing === item.key ? (
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="number"
                  className="w-24 px-2 py-1 border border-input rounded text-sm bg-background text-foreground"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && save()}
                  autoFocus
                />
                <button onClick={save} className="text-gain"><Check className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-base font-bold ${item.color}`}>{fmt(item.value)}</span>
                <button onClick={() => startEdit(item.key)} className="text-muted-foreground hover:text-primary transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
