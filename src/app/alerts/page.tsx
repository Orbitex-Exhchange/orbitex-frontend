"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BellRing, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicMarkets, usePublicTickers } from '@/lib/api/services/public';
import { AgentInsight, displayMarket, normalizeTickers } from '@/lib/ambient-exchange';
import { cn, formatCurrency, formatPercentage, toFiniteNumber } from '@/lib/utils';
import { AgentConsole, AmbientPageShell, AmbientPanel, EmptyState, MetricTile } from '@/components/ambient/AmbientExchange';

type AlertCondition = 'above' | 'below';

interface PriceAlert {
  id: string;
  market: string;
  condition: AlertCondition;
  target: number;
  active: boolean;
  createdAt: string;
  triggeredAt?: string;
}

const STORAGE_KEY = 'orbitex.price-alerts.v1';

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AlertsPage() {
  const { user } = useAuth();
  const { data: markets = [] } = usePublicMarkets();
  const { data: rawTickers = [] } = usePublicTickers();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [market, setMarket] = useState('btcusd');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [target, setTarget] = useState('70000');

  const tickers = useMemo(() => normalizeTickers(rawTickers, markets), [rawTickers, markets]);
  const tickerMap = useMemo(() => new Map(tickers.map((ticker) => [ticker.market, ticker])), [tickers]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setAlerts(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to load local alerts:', error);
    }
  }, []);

  useEffect(() => {
    if (markets.length && !markets.some((item) => item.id === market)) {
      setMarket(markets[0]?.id || 'btcusd');
    }
  }, [markets, market]);

  useEffect(() => {
    setAlerts((current) => {
      let changed = false;
      const next = current.map((alert) => {
        if (!alert.active || alert.triggeredAt) return alert;
        const price = tickerMap.get(alert.market)?.last;
        if (!price) return alert;
        const triggered = alert.condition === 'above' ? price >= alert.target : price <= alert.target;
        if (!triggered) return alert;
        changed = true;
        return { ...alert, triggeredAt: new Date().toISOString() };
      });
      if (changed) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return changed ? next : current;
    });
  }, [tickerMap]);

  const persist = (next: PriceAlert[]) => {
    setAlerts(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedTarget = toFiniteNumber(target);
    if (!parsedTarget || !market) return;
    persist([
      {
        id: createId(),
        market,
        condition,
        target: parsedTarget,
        active: true,
        createdAt: new Date().toISOString(),
      },
      ...alerts,
    ]);
  };

  const toggleAlert = (id: string) => {
    persist(alerts.map((alert) => alert.id === id ? { ...alert, active: !alert.active } : alert));
  };

  const deleteAlert = (id: string) => {
    persist(alerts.filter((alert) => alert.id !== id));
  };

  const triggeredCount = alerts.filter((alert) => alert.triggeredAt).length;
  const activeCount = alerts.filter((alert) => alert.active && !alert.triggeredAt).length;
  const nearest = alerts
    .filter((alert) => alert.active && !alert.triggeredAt && tickerMap.has(alert.market))
    .map((alert) => {
      const price = tickerMap.get(alert.market)?.last || 0;
      const distance = price > 0 ? Math.abs((alert.target - price) / price) * 100 : 999;
      return { alert, distance };
    })
    .sort((a, b) => a.distance - b.distance)[0];

  const insights: AgentInsight[] = [
    {
      id: 'alert-coverage',
      agent: 'Alert Agent',
      title: activeCount ? `${activeCount} active market trigger${activeCount === 1 ? '' : 's'}` : 'No active alerts armed',
      message: activeCount ? 'Local alert evaluation is polling live Orbitex tickers in-browser.' : 'Create a price alert to arm local browser-side monitoring.',
      severity: activeCount ? 'success' : 'info',
      metric: `${activeCount} active`,
    },
    {
      id: 'nearest-trigger',
      agent: 'Proximity Agent',
      title: nearest ? `${displayMarket(nearest.alert.market, markets)} nearest trigger` : 'No trigger proximity yet',
      message: nearest ? `${formatPercentage(nearest.distance)} away from ${nearest.alert.condition} ${formatCurrency(nearest.alert.target)}.` : 'Alerts will rank by distance once active triggers exist.',
      severity: nearest && nearest.distance < 1 ? 'warning' : 'info',
      metric: nearest ? formatPercentage(nearest.distance) : 'Idle',
    },
  ];

  return (
    <AmbientPageShell user={user} title="Price Alerts" description="LocalStorage-backed browser alerts evaluated against verified live Orbitex ticker polling." tickers={tickers}>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricTile label="Active Alerts" value={activeCount} detail="Armed in this browser" icon={BellRing} tone="success" />
        <MetricTile label="Triggered" value={triggeredCount} detail="Local trigger history" icon={CheckCircle2} tone={triggeredCount ? 'warning' : 'neutral'} />
        <MetricTile label="Markets Online" value={tickers.length} detail="Ticker rows from backend-rust" icon={Plus} tone="info" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <AmbientPanel title="Alert Builder" icon={BellRing}>
          <form onSubmit={onSubmit} className="grid gap-3 rounded-md border border-slate-700/70 bg-slate-950/55 p-3 md:grid-cols-[1fr_10rem_1fr_auto]">
            <select value={market} onChange={(event) => setMarket(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none">
              {markets.map((item) => <option key={item.id} value={item.id}>{displayMarket(item.id, markets)}</option>)}
            </select>
            <select value={condition} onChange={(event) => setCondition(event.target.value as AlertCondition)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none">
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <input value={target} onChange={(event) => setTarget(event.target.value)} inputMode="decimal" placeholder="Target price" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <Button className="btn-gradient-primary"><Plus className="mr-2 h-4 w-4" />Create</Button>
          </form>

          <div className="mt-5 space-y-3">
            {alerts.length ? alerts.map((alert) => {
              const ticker = tickerMap.get(alert.market);
              const current = ticker?.last || 0;
              const distance = current > 0 ? Math.abs((alert.target - current) / current) * 100 : 0;
              return (
                <div key={alert.id} className="rounded-md border border-slate-700/70 bg-slate-950/55 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{displayMarket(alert.market, markets)}</span>
                        <span className={cn('rounded-full px-2 py-1 text-xs font-semibold', alert.triggeredAt ? 'bg-amber-400/15 text-amber-200' : alert.active ? 'bg-emerald-400/15 text-emerald-200' : 'bg-slate-700 text-slate-300')}>
                          {alert.triggeredAt ? 'Triggered' : alert.active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-slate-400">Trigger {alert.condition} {formatCurrency(alert.target)} · Current {current ? formatCurrency(current) : '--'} · Distance {formatPercentage(distance)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => toggleAlert(alert.id)} className="border-slate-700 bg-slate-950/60 text-slate-200 hover:bg-slate-900">{alert.active ? 'Pause' : 'Arm'}</Button>
                      <Button type="button" variant="outline" onClick={() => deleteAlert(alert.id)} className="border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              );
            }) : <EmptyState title="No local alerts" message="Create browser-side alerts for live Orbitex markets. They persist in localStorage on this device." icon={BellRing} />}
          </div>
        </AmbientPanel>

        <AgentConsole insights={insights} />
      </section>
    </AmbientPageShell>
  );
}
