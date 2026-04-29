import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoginGate } from '@/components/LoginGate';
import { PrivacyProvider } from '@/contexts/PrivacyContext';
import { ArrowLeft, Eye, EyeOff, Info } from 'lucide-react';

interface NetWorthPoint {
  recorded_at: string;
  net_worth: number;
}

interface RollingReturnPoint {
  label: string;
  recorded_at: string;
  rollingReturn: number;
}

const RollingReturnsContent = () => {
  const { hidden, toggle } = usePrivacy();
  const [data, setData] = useState<RollingReturnPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: rows } = await supabase
        .from('net_worth_history')
        .select('recorded_at, net_worth')
        .order('recorded_at', { ascending: true });

      if (rows && rows.length > 0) {
        const points = rows.map((r: any) => ({
          recorded_at: r.recorded_at,
          net_worth: Number(r.net_worth),
        }));

        const rolling: RollingReturnPoint[] = points.map((point, index) => {
          const date = new Date(point.recorded_at);
          const oneYearAgo = new Date(date);
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          
          // Find a point approximately 1 year ago (± 15 days for some flexibility)
          const prevPoint = points.slice(0, index).reverse().find(p => {
            const pDate = new Date(p.recorded_at);
            return pDate <= oneYearAgo;
          });
          
          if (prevPoint && prevPoint.net_worth > 0) {
            const returnVal = ((point.net_worth / prevPoint.net_worth) - 1) * 100;
            return {
              recorded_at: point.recorded_at,
              label: new Date(point.recorded_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
              rollingReturn: returnVal,
            };
          }
          return null;
        }).filter((p): p is RollingReturnPoint => p !== null);

        setData(rolling);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Calculating rolling returns...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Rolling Returns</h1>
              <p className="text-xs text-muted-foreground">1-Year rolling performance of your total net worth</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {hidden ? 'Show' : 'Hide'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 flex gap-3 text-sm text-muted-foreground">
          <Info className="w-5 h-5 text-blue-500 shrink-0" />
          <p>
            Rolling returns show the annualized return for a specific period (1 Year) ending on each date. 
            This helps visualize how consistent your portfolio performance has been across different market cycles.
            {data.length === 0 && " Note: At least 1 year of history is required to generate this chart."}
          </p>
        </div>

        {/* Chart */}
        {data.length > 0 ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-medium text-foreground">1-Year Rolling Return (%)</h3>
                  <p className="text-xs text-muted-foreground mt-1">Based on historical net worth snapshots</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {data[data.length - 1].rollingReturn.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Latest Point</p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    className="fill-muted-foreground" 
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(v: number) => [`${v.toFixed(2)}%`, 'Rolling Return']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rollingReturn" 
                    stroke="hsl(213, 75%, 55%)" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Average Return</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {(data.reduce((sum, p) => sum + p.rollingReturn, 0) / data.length).toFixed(2)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Best 1Y Period</p>
                <p className="text-xl font-bold text-gain mt-1">
                  {Math.max(...data.map(p => p.rollingReturn)).toFixed(2)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Worst 1Y Period</p>
                <p className="text-xl font-bold text-loss mt-1">
                  {Math.min(...data.map(p => p.rollingReturn)).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg text-center p-8">
            <div className="bg-muted rounded-full p-4 mb-4">
              <Info className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Not Enough History</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-2">
              We need at least 12 months of net worth snapshots to calculate rolling returns. 
              As you record more transactions and snapshots, this chart will populate automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const RollingReturns = () => (
  <LoginGate>
    <PrivacyProvider>
      <RollingReturnsContent />
    </PrivacyProvider>
  </LoginGate>
);

export default RollingReturns;
