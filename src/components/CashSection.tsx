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

  const [editing, setEditing] = useState<'liquid' | 'vault' | null>(null);
  const [inputVal, setInputVal] = useState('');

  const startEdit = (field: 'liquid' | 'vault') => {
    setEditing(field);
    setInputVal(field === 'liquid' ? cash.liquidCash.toString() : cash.vaultCash.toString());
  };

  const save = () => {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val >= 0 && editing) {
      onUpdate(editing === 'liquid' ? { liquidCash: val } : { vaultCash: val });
    }
    setEditing(null);
  };

  const items = [
    { key: 'liquid' as const, label: 'Liquid Cash', value: cash.liquidCash },
    { key: 'vault' as const, label: 'Vault Cash (ICICI)', value: cash.vaultCash },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground mb-3">Cash Management</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-2 rounded bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              {editing === item.key ? (
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    className="w-28 px-2 py-1 border border-input rounded text-sm bg-background text-foreground"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && save()}
                    autoFocus
                  />
                  <button onClick={save} className="text-gain"><Check className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm font-semibold text-foreground">{fmt(item.value)}</span>
                  <button onClick={() => startEdit(item.key)} className="text-muted-foreground hover:text-primary">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
