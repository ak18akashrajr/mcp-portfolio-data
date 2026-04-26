import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Play, TrendingDown, Shuffle, ArrowDownUp, Percent } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PrivacyProvider, usePrivacy } from '@/contexts/PrivacyContext';
import { LoginGate } from '@/components/LoginGate';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, BarChart, Bar,
} from 'recharts';
import {
  projectXIRR, simulateCrash, runMonteCarlo, simulateSequenceRisk, simulateInflation,
  type ProjectionInputs, type XIRRProjectionResult, type CrashScenarioResult,
  type MonteCarloResult, type SequenceRiskResult, type InflationResult,
} from '@/lib/projectionEngine';

function fmt(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

function fmtFull(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

// ── Stat Card ──
const StatCard = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) => (
  <div className="rounded-lg border border-border bg-card p-3">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className={`text-lg font-bold ${color || 'text-foreground'}`}>{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
  </div>
);

const DescriptionBox = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground leading-relaxed space-y-1">
    {children}
  </div>
);

// ── XIRR Tab ──
const XIRRTab = ({ result, hidden, inputs }: { result: XIRRProjectionResult; hidden: boolean; inputs: ProjectionInputs }) => {
  const data = result.baseTimeline.map((pt, i) => ({
    year: `Y${pt.year}`,
    base: pt.value,
    conservative: result.conservativeTimeline[i]?.value ?? 0,
  }));

  return (
    <div className="space-y-4">
      <DescriptionBox>
        <p className="font-medium text-foreground text-sm mb-1">📈 What this shows</p>
        <p>Starting with <strong className="text-foreground">{hidden ? '••••' : fmtFull(inputs.initialInvestment)}</strong>, adding <strong className="text-foreground">{hidden ? '••••' : fmtFull(inputs.monthlySIP)}/mo</strong> SIP{inputs.monthlyWithdrawal > 0 ? ` and withdrawing ${hidden ? '••••' : fmtFull(inputs.monthlyWithdrawal)}/mo` : ''}, this projects your portfolio over <strong className="text-foreground">{inputs.timeHorizonYears} years</strong>.</p>
        <p>The <strong className="text-green-500">green line</strong> uses your portfolio's actual XIRR of <strong className="text-green-500">{(result.baseXIRR * 100).toFixed(1)}%</strong>. The <strong className="text-yellow-500">yellow line</strong> is a conservative estimate at <strong className="text-yellow-500">{(result.conservativeXIRR * 100).toFixed(1)}%</strong> (20% lower), showing what happens if markets underperform.</p>
        <p>The gap between both lines widens over time — this is the <em>compounding effect of even small return differences</em>.</p>
      </DescriptionBox>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Base XIRR" value={`${(result.baseXIRR * 100).toFixed(1)}%`} color="text-green-500" />
        <StatCard label="Conservative XIRR" value={`${(result.conservativeXIRR * 100).toFixed(1)}%`} color="text-yellow-500" />
        <StatCard label="Base Final" value={hidden ? '••••' : fmt(result.baseFinalValue)} />
        <StatCard label="Conservative Final" value={hidden ? '••••' : fmt(result.conservativeFinalValue)} />
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142,71%,45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142,71%,45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gCons" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(45,93%,47%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(45,93%,47%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis tickFormatter={v => hidden ? '•••' : fmt(v)} tick={{ fontSize: 11 }} className="fill-muted-foreground" width={70} />
            <Tooltip formatter={(v: number) => hidden ? '••••' : fmtFull(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="base" name="Base XIRR" stroke="hsl(142,71%,45%)" fill="url(#gBase)" strokeWidth={2} />
            <Area type="monotone" dataKey="conservative" name="Conservative (−20%)" stroke="hsl(45,93%,47%)" fill="url(#gCons)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ── Crash Tab ──
const CrashTab = ({ result, hidden, inputs }: { result: CrashScenarioResult; hidden: boolean; inputs: ProjectionInputs }) => (
  <div className="space-y-4">
    <DescriptionBox>
      <p className="font-medium text-foreground text-sm mb-1">💥 What this shows</p>
      <p>If a market crash happens <em>right now</em> on your <strong className="text-foreground">{hidden ? '••••' : fmtFull(inputs.initialInvestment)}</strong> portfolio, these cards show the immediate impact at 3 severity levels (−20%, −35%, −50%).</p>
      <p><strong>Post-crash value</strong> = your portfolio immediately after the drop. <strong>Drawdown</strong> = how much you lose. <strong>Recovery time</strong> = years needed to recover at {inputs.expectedReturnPct}% annual returns. <strong>Final value</strong> = where you'd end up after {inputs.timeHorizonYears} years post-crash, assuming {hidden ? '••••' : fmtFull(inputs.monthlySIP)}/mo SIP continues.</p>
    </DescriptionBox>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {result.scenarios.map(s => (
        <div key={s.dropPct} className="rounded-lg border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="font-bold text-foreground">−{s.dropPct}% Crash</span>
          </div>
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">Post-crash value: <span className="text-foreground font-medium">{hidden ? '••••' : fmtFull(s.postCrashValue)}</span></p>
            <p className="text-muted-foreground">Drawdown: <span className="text-red-500 font-medium">{hidden ? '••••' : fmtFull(s.drawdown)}</span></p>
            <p className="text-muted-foreground">Recovery time: <span className="text-yellow-500 font-medium">{s.recoveryYears === Infinity ? 'N/A' : `${s.recoveryYears} yrs`}</span></p>
            <p className="text-muted-foreground">Final value: <span className="text-foreground font-medium">{hidden ? '••••' : fmtFull(s.finalValue)}</span></p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Monte Carlo Tab ──
const MonteCarloTab = ({ result, hidden, inputs }: { result: MonteCarloResult; hidden: boolean; inputs: ProjectionInputs }) => {
  const timelineData = result.percentileTimelines.p50.map((pt, i) => ({
    year: `Y${pt.year}`,
    p10: result.percentileTimelines.p10[i]?.value ?? 0,
    p50: pt.value,
    p90: result.percentileTimelines.p90[i]?.value ?? 0,
  }));

  return (
    <div className="space-y-4">
      <DescriptionBox>
        <p className="font-medium text-foreground text-sm mb-1">🎲 What this shows</p>
        <p>1,000 random market scenarios were simulated for your <strong className="text-foreground">{hidden ? '••••' : fmtFull(inputs.initialInvestment)}</strong> portfolio over <strong className="text-foreground">{inputs.timeHorizonYears} years</strong> with {hidden ? '••••' : fmtFull(inputs.monthlySIP)}/mo SIP, using {inputs.expectedReturnPct}% average return and ~18% volatility (typical for Indian equities).</p>
        <p><strong>Median</strong> = the middle outcome (50% chance of doing better/worse). <strong>90th %ile</strong> = optimistic scenario (only 10% chance of exceeding). <strong>10th %ile</strong> = pessimistic scenario (90% chance of doing better). <strong>Goal probability</strong> = chance your portfolio doubles to {hidden ? '••••' : fmtFull(inputs.initialInvestment * 2)}.</p>
        <p>The <em>fan chart</em> shows how uncertainty grows over time — wider spread = more unpredictable outcomes.</p>
      </DescriptionBox>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Worst Case" value={hidden ? '••••' : fmt(result.worst)} color="text-red-500" />
        <StatCard label="10th %ile" value={hidden ? '••••' : fmt(result.percentile10)} color="text-yellow-500" />
        <StatCard label="Median" value={hidden ? '••••' : fmt(result.median)} color="text-foreground" />
        <StatCard label="90th %ile" value={hidden ? '••••' : fmt(result.percentile90)} color="text-green-500" />
        <StatCard label="Goal (2x) Prob" value={`${result.goalProbability}%`} color="text-blue-500" sub="Chance of doubling" />
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2">Percentile Fan Chart (1000 simulations)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="gFan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(220,70%,55%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(220,70%,55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis tickFormatter={v => hidden ? '•••' : fmt(v)} tick={{ fontSize: 11 }} className="fill-muted-foreground" width={70} />
            <Tooltip formatter={(v: number) => hidden ? '••••' : fmtFull(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="p90" name="90th Percentile" stroke="hsl(142,71%,45%)" fill="url(#gFan)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="p50" name="Median" stroke="hsl(220,70%,55%)" fill="none" strokeWidth={2} />
            <Area type="monotone" dataKey="p10" name="10th Percentile" stroke="hsl(0,72%,51%)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2">Outcome Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={result.distribution}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="bucket" tick={{ fontSize: 9 }} className="fill-muted-foreground" interval={3} />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <Tooltip />
            <Bar dataKey="count" name="Simulations" fill="hsl(220,70%,55%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ── Sequence Risk Tab ──
const SequenceRiskTab = ({ result, hidden, inputs }: { result: SequenceRiskResult; hidden: boolean; inputs: ProjectionInputs }) => {
  const data = result.uniformTimeline.map((pt, i) => ({
    year: `Y${pt.year}`,
    uniform: pt.value,
    earlyBad: result.earlyBadTimeline[i]?.value ?? 0,
    lateBad: result.lateBadTimeline[i]?.value ?? 0,
  }));

  return (
    <div className="space-y-4">
      <DescriptionBox>
        <p className="font-medium text-foreground text-sm mb-1">🔀 What this shows</p>
        <p>Even with the same average return ({inputs.expectedReturnPct}%), the <em>order</em> of good and bad years matters dramatically — especially if you're withdrawing {hidden ? '••••' : fmtFull(inputs.monthlyWithdrawal)}/mo.</p>
        <p><strong className="text-blue-500">Uniform</strong> = steady {inputs.expectedReturnPct}% every year. <strong className="text-yellow-500">Early Bad</strong> = −15% returns in the first 2 years, then above-average to compensate. <strong className="text-red-500">Late Bad</strong> = −15% returns in the last 2 years.</p>
        <p>{inputs.monthlyWithdrawal > 0 ? 'With withdrawals, early bad years are devastating because you\'re selling at low prices, permanently reducing your base.' : 'With no withdrawals, early bad years actually benefit SIP investors (rupee cost averaging). Late bad years hurt more because you lose gains on a larger corpus.'}</p>
      </DescriptionBox>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Uniform Returns" value={hidden ? '••••' : fmt(result.uniformFinal)} color="text-blue-500" />
        <StatCard label="Early Bad Years" value={hidden ? '••••' : fmt(result.earlyBadFinal)} color="text-yellow-500" sub="Bad years at start" />
        <StatCard label="Late Bad Years" value={hidden ? '••••' : fmt(result.lateBadFinal)} color="text-red-500" sub="Bad years at end" />
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis tickFormatter={v => hidden ? '•••' : fmt(v)} tick={{ fontSize: 11 }} className="fill-muted-foreground" width={70} />
            <Tooltip formatter={(v: number) => hidden ? '••••' : fmtFull(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="uniform" name="Uniform" stroke="hsl(220,70%,55%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="earlyBad" name="Early Bad" stroke="hsl(45,93%,47%)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="lateBad" name="Late Bad" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ── Inflation Tab ──
const InflationTab = ({ result, hidden, inputs }: { result: InflationResult; hidden: boolean; inputs: ProjectionInputs }) => (
  <div className="space-y-4">
    <DescriptionBox>
      <p className="font-medium text-foreground text-sm mb-1">📉 What this shows</p>
      <p>Your portfolio may grow to impressive nominal values, but inflation silently erodes purchasing power. This compares what your money is <em>worth in today's rupees</em> at 3 inflation rates (5%, 7%, 9%).</p>
      <p>With {inputs.expectedReturnPct}% returns and 7% inflation, your <em>real return</em> is only ~{(inputs.expectedReturnPct - 7).toFixed(0)}% — meaning {hidden ? '••••' : fmtFull(inputs.initialInvestment)} today needs to grow significantly just to maintain its buying power over {inputs.timeHorizonYears} years.</p>
      <p>The <strong>purchasing power loss %</strong> shows how much of your gains are consumed by inflation alone.</p>
    </DescriptionBox>
    {result.scenarios.map(s => (
      <div key={s.inflationPct} className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">{s.inflationPct}% Inflation</h3>
          <span className="text-xs text-red-500 font-medium">−{s.purchasingPowerLoss}% purchasing power</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Nominal Value" value={hidden ? '••••' : fmt(s.nominalFinal)} />
          <StatCard label="Real Value" value={hidden ? '••••' : fmt(s.realFinal)} color="text-yellow-500" />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={s.nominalTimeline.map((pt, i) => ({
            year: `Y${pt.year}`,
            nominal: pt.value,
            real: s.realTimeline[i]?.value ?? 0,
          }))}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
            <YAxis tickFormatter={v => hidden ? '•••' : fmt(v)} tick={{ fontSize: 10 }} className="fill-muted-foreground" width={65} />
            <Tooltip formatter={(v: number) => hidden ? '••••' : fmtFull(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="nominal" name="Nominal" stroke="hsl(220,70%,55%)" fill="none" strokeWidth={2} />
            <Area type="monotone" dataKey="real" name="Real" stroke="hsl(45,93%,47%)" fill="none" strokeWidth={2} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    ))}
  </div>
);

// ── Main Page ──
const ProjectionsContent = () => {
  const { hidden, toggle } = usePrivacy();
  const { summary, loading } = usePortfolio();

  const [inputs, setInputs] = useState<ProjectionInputs>({
    initialInvestment: 0,
    monthlySIP: 5000,
    timeHorizonYears: 10,
    expectedReturnPct: 12,
    monthlyWithdrawal: 0,
  });

  const [hasRun, setHasRun] = useState(false);

  // Pre-fill initial investment from portfolio
  useState(() => {
    if (summary.currentValue > 0) {
      setInputs(prev => ({ ...prev, initialInvestment: Math.round(summary.currentValue) }));
    }
  });

  const [xirrResult, setXirrResult] = useState<XIRRProjectionResult | null>(null);
  const [crashResult, setCrashResult] = useState<CrashScenarioResult | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [seqResult, setSeqResult] = useState<SequenceRiskResult | null>(null);
  const [infResult, setInfResult] = useState<InflationResult | null>(null);

  const runAll = () => {
    const inp = { ...inputs, initialInvestment: inputs.initialInvestment || summary.currentValue };
    setXirrResult(projectXIRR(inp, summary.xirr));
    setCrashResult(simulateCrash(inp));
    setMcResult(runMonteCarlo(inp));
    setSeqResult(simulateSequenceRisk(inp));
    setInfResult(simulateInflation(inp));
    setHasRun(true);
  };

  const updateInput = (key: keyof ProjectionInputs, value: string) => {
    setInputs(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Projection Engine</h1>
              <p className="text-xs text-muted-foreground">5 scenario simulations for your portfolio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={toggle} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors">
              {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {hidden ? 'Show' : 'Hide'}
            </button>
          </div>
        </div>

        {/* Input Panel */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium text-foreground mb-3">Simulation Inputs</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Initial Investment (₹)</Label>
              <Input type="number" value={inputs.initialInvestment || ''} onChange={e => updateInput('initialInvestment', e.target.value)} placeholder={summary.currentValue.toFixed(0)} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly SIP (₹)</Label>
              <Input type="number" value={inputs.monthlySIP || ''} onChange={e => updateInput('monthlySIP', e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Time Horizon (Years)</Label>
              <Input type="number" value={inputs.timeHorizonYears || ''} onChange={e => updateInput('timeHorizonYears', e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Expected Return (%)</Label>
              <Input type="number" value={inputs.expectedReturnPct || ''} onChange={e => updateInput('expectedReturnPct', e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly Withdrawal (₹)</Label>
              <Input type="number" value={inputs.monthlyWithdrawal || ''} onChange={e => updateInput('monthlyWithdrawal', e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
          </div>
          <button onClick={runAll} className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Play className="w-4 h-4" />
            Run All Simulations
          </button>
        </div>

        {/* Results */}
        {hasRun && (
          <Tabs defaultValue="xirr" className="space-y-4">
            <TabsList className="w-full flex overflow-x-auto">
              <TabsTrigger value="xirr" className="flex-1 text-xs gap-1"><Play className="w-3 h-3" /> XIRR</TabsTrigger>
              <TabsTrigger value="crash" className="flex-1 text-xs gap-1"><TrendingDown className="w-3 h-3" /> Crash</TabsTrigger>
              <TabsTrigger value="montecarlo" className="flex-1 text-xs gap-1"><Shuffle className="w-3 h-3" /> Monte Carlo</TabsTrigger>
              <TabsTrigger value="sequence" className="flex-1 text-xs gap-1"><ArrowDownUp className="w-3 h-3" /> Sequence</TabsTrigger>
              <TabsTrigger value="inflation" className="flex-1 text-xs gap-1"><Percent className="w-3 h-3" /> Inflation</TabsTrigger>
            </TabsList>

            <TabsContent value="xirr">{xirrResult && <XIRRTab result={xirrResult} hidden={hidden} inputs={inputs} />}</TabsContent>
            <TabsContent value="crash">{crashResult && <CrashTab result={crashResult} hidden={hidden} inputs={inputs} />}</TabsContent>
            <TabsContent value="montecarlo">{mcResult && <MonteCarloTab result={mcResult} hidden={hidden} inputs={inputs} />}</TabsContent>
            <TabsContent value="sequence">{seqResult && <SequenceRiskTab result={seqResult} hidden={hidden} inputs={inputs} />}</TabsContent>
            <TabsContent value="inflation">{infResult && <InflationTab result={infResult} hidden={hidden} inputs={inputs} />}</TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

const Projections = () => (
  <LoginGate>
    <PrivacyProvider>
      <ProjectionsContent />
    </PrivacyProvider>
  </LoginGate>
);

export default Projections;
