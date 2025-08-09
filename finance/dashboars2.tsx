import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronRight, Copy, Play, Pause, Plus, Search, Settings, ShieldAlert, TrendingUp, TriangleAlert } from "lucide-react";

// --- Sample placeholder data (for mock/demo) ---
const samplePositions = [
  { ticker: "DELL", last: 152.34, pctToStop: -5.9, rsi: 68, atr: 3.1, ceDist: 4.2, notes: "Core/GARP", fired: false },
  { ticker: "ANET", last: 144.12, pctToStop: -6.3, rsi: 72, atr: 4.5, ceDist: 2.1, notes: "Momentum", fired: true },
  { ticker: "MU", last: 131.75, pctToStop: -4.8, rsi: 66, atr: 3.9, ceDist: 1.5, notes: "Momentum", fired: false },
  { ticker: "QQQ", last: 512.02, pctToStop: "—", rsi: 71, atr: 6.8, ceDist: 2.8, notes: "ETF – No Stop", fired: false },
  { ticker: "VGT", last: 674.55, pctToStop: "—", rsi: 69, atr: 7.2, ceDist: 1.2, notes: "ETF – No Stop", fired: false },
];

const stretchUniverse = ["HOOD", "QQQ", "VGT", "ARKK"]; // for header chip display

const ordersParked = [
  { id: "A", text: "ANET 70 >136.20 sl 129.80 tp 154.00", risk: "0.23% NAV" },
  { id: "B", text: "DELL 180 >149.60 sl 141.00 tp 176.00", risk: "0.24% NAV" },
  { id: "C", text: "MU 120 >127.40 sl 121.60 tp 138.50", risk: "0.21% NAV" },
];

const ordersArmed = [
  { id: "H1", text: "QQQ puts 0.5% NAV (nearest-expiry)", risk: "Hedge Pack" },
];

const catalysts = [
  { date: "Aug 13", ticker: "NVDA", type: "Earnings (AMC)", tMinus2: true },
  { date: "Aug 14", ticker: "CPI", type: "Macro", tMinus2: false },
  { date: "Aug 20", ticker: "FOMC", type: "Macro", tMinus2: false },
];

const heatRows = [
  { name: "XLK", roc20: 6.2, roc50: 9.1, roc100: 14.2, rank: 1 },
  { name: "XLF", roc20: 1.4, roc50: 2.3, roc100: 4.2, rank: 6 },
  { name: "XLE", roc20: -0.8, roc50: -2.1, roc100: -5.9, rank: 10 },
  { name: "XLV", roc20: 2.1, roc50: 3.8, roc100: 5.6, rank: 4 },
];

function colorByROC(rank: number) {
  if (rank <= 3) return "bg-emerald-500/15 text-emerald-600";
  if (rank <= 6) return "bg-amber-500/15 text-amber-600";
  return "bg-rose-500/15 text-rose-600";
}

export default function DashboardMock() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"Standard" | "Lite" | "Strict Risk" | "Power User">("Standard");
  const [vol, setVol] = useState<"HOT" | "WARM" | "ICY">("WARM");

  const filtered = useMemo(() => {
    if (!query) return samplePositions;
    return samplePositions.filter(r => r.ticker.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-[1200px] px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Weekly Humble‑Check Dashboard</h1>
            <p className="text-sm text-muted-foreground">After U.S. close · Stretch universe: {stretchUniverse.map(s => (
              <Badge key={s} variant="outline" className="mx-1">{s}</Badge>
            ))}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={vol === "HOT" ? "bg-emerald-600" : vol === "WARM" ? "bg-amber-600" : "bg-rose-600"}>{vol}</Badge>
            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option>Standard</option>
              <option>Lite</option>
              <option>Strict Risk</option>
              <option>Power User</option>
            </select>
            <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2"/>Settings</Button>
          </div>
        </div>

        {/* Command bar */}
        <div className="flex items-center gap-2 rounded-2xl border bg-background p-2 shadow-sm">
          <Search className="h-4 w-4 ml-2"/>
          <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Type a command or filter tickers… e.g., Need A Trade (Standard)" className="border-0 focus-visible:ring-0"/>
          <Button className="rounded-xl"><Play className="h-4 w-4 mr-2"/>Run</Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-base">Portfolio NAV</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">$1,342,900</div>
              <div className="text-xs text-muted-foreground">Pace‑to‑Goal: <span className="font-medium">ON</span></div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-base">Free Cash</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">$62,400</div>
              <div className="text-xs text-muted-foreground">Floor: $15k · Gate: $25k</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-base">Risk Envelope</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">6.3% NAV</div>
              <div className="text-xs text-muted-foreground">Worst‑case to stops (≤ 7%)</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-base">Vol Regime</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5"/> {vol}</div>
              <div className="text-xs text-muted-foreground">VIX term: contango · VVIX 92</div>
            </CardContent>
          </Card>
        </div>

        {/* Deltas Table */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-base">1) Dashboard refresh — Deltas since last Fri</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-2 text-left">Ticker</th>
                    <th className="py-2 text-right">Last</th>
                    <th className="py-2 text-right">%‑to‑Stop</th>
                    <th className="py-2 text-center">Fired?</th>
                    <th className="py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.ticker} className="border-t">
                      <td className="py-2 font-medium">{r.ticker}</td>
                      <td className="py-2 text-right">{typeof r.last === "number" ? r.last.toFixed(2) : r.last}</td>
                      <td className="py-2 text-right">{typeof r.pctToStop === "number" ? `${r.pctToStop.toFixed(1)}%` : r.pctToStop}</td>
                      <td className="py-2 text-center">{r.fired ? <Badge variant="secondary">Yes</Badge> : "—"}</td>
                      <td className="py-2">{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Stretch‑Scan & Rotation */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-base">2) Stretch‑Scan (HOOD, QQQ, VGT, ARKK)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <div className="font-medium">QQQ</div>
                  <Badge variant="outline">RSI 71 · ≥ 20‑SMA + 2×ATR</Badge>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">Trim 15%</Button>
                    <Button size="sm" variant="ghost">Why<ChevronRight className="h-4 w-4 ml-1"/></Button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <div className="font-medium">VGT</div>
                  <Badge variant="secondary">Near trigger</Badge>
                  <Button size="sm" variant="outline">Prep ticket</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-base">3) Momentum / Rotation — Sector heat‑map</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="py-2 text-left">Sector</th>
                      <th className="py-2 text-right">ROC‑20d</th>
                      <th className="py-2 text-right">ROC‑50d</th>
                      <th className="py-2 text-right">ROC‑100d</th>
                      <th className="py-2 text-right">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatRows.map((row) => (
                      <tr key={row.name} className="border-t">
                        <td className="py-2 font-medium">{row.name}</td>
                        <td className="py-2 text-right">{row.roc20.toFixed(1)}%</td>
                        <td className="py-2 text-right">{row.roc50.toFixed(1)}%</td>
                        <td className="py-2 text-right">{row.roc100.toFixed(1)}%</td>
                        <td className="py-2 text-right">
                          <span className={`px-2 py-1 rounded-lg text-xs ${colorByROC(row.rank)}`}>{row.rank}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">→ Bias nudge: overweight XLK; underweight XLE</div>
            </CardContent>
          </Card>
        </div>

        {/* Heat‑Alert + Cash + Catalysts */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4"/>4) Heat‑Alert</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Layer‑1:</strong> None flagged</div>
              <div><strong>Layer‑2:</strong> VIX 20.8 (no trigger)</div>
              <Button size="sm" variant="outline" className="rounded-xl mt-2">Prep Hedge Pack</Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-base">5) Cash check</CardTitle></CardHeader>
            <CardContent className="text-sm">
              Free cash $62,400 (≥ $15k). No trims needed. 
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" className="rounded-xl">Raise cash</Button>
                <Button size="sm" className="rounded-xl" variant="secondary">Deploy cash</Button>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TriangleAlert className="h-4 w-4"/>6) Upcoming catalysts (7–10d)</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                {catalysts.map(c => (
                  <li key={c.ticker + c.date} className="flex items-center justify-between">
                    <span>{c.date} · {c.ticker} · {c.type}</span>
                    {c.tMinus2 && <Badge variant="destructive">T‑2 tighten</Badge>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-base">Orders</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="parked">
              <TabsList className="rounded-xl">
                <TabsTrigger value="parked">Draft (PARKED)</TabsTrigger>
                <TabsTrigger value="armed">Armed</TabsTrigger>
                <TabsTrigger value="filled">Filled</TabsTrigger>
              </TabsList>
              <TabsContent value="parked" className="mt-3 space-y-2">
                {ordersParked.map(o => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border p-3">
                    <div className="text-sm"><span className="font-medium mr-2">{o.id})</span>{o.text} <span className="text-muted-foreground">· {o.risk}</span></div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="rounded-xl">Copy<Copy className="h-3.5 w-3.5 ml-2"/></Button>
                      <Button size="sm" className="rounded-xl">Arm</Button>
                      <Button size="sm" variant="ghost" className="rounded-xl">Park</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="armed" className="mt-3 space-y-2">
                {ordersArmed.map(o => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border p-3">
                    <div className="text-sm"><span className="font-medium mr-2">{o.id})</span>{o.text}</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="rounded-xl">Pause<Pause className="h-3.5 w-3.5 ml-2"/></Button>
                      <Button size="sm" className="rounded-xl">Fire</Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="filled" className="mt-3 text-sm text-muted-foreground">
                No fills in this demo.
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">© 2025 — Stops Engine · Humble‑Check · Order Builder</div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl">Copy report</Button>
            <Button className="rounded-xl"><Plus className="h-4 w-4 mr-2"/>Build tickets</Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
