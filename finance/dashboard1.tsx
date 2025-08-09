import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Copy, Play, Pause, Plus, Search, Settings, ShieldAlert, TrendingUp, TriangleAlert, Sheet as SheetIcon, ListPlus, Layers3, PlusCircle } from "lucide-react";

// --- Sample placeholder data (for mock/demo) ---
const sampleSheets = [
  { id: "main", name: "Main Portfolio (Google Sheet)", range: "Portfolio!A1:Q" },
  { id: "swing", name: "Swing Book", range: "Swing!A1:Q" },
];

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

const watchlist = [
  { ticker: "ALAB", tag: "Swing", note: "PEG setup forming", score: 7.8 },
  { ticker: "MSFT", tag: "Core", note: "Quality compounder", score: 8.9 },
  { ticker: "ANET", tag: "GARP", note: "Re-accel on cloud capex", score: 8.3 },
  { ticker: "SOUN", tag: "Moonshot", note: "Speculative AI", score: 5.6 },
];

function colorByROC(rank: number) {
  if (rank <= 3) return "bg-emerald-500/15 text-emerald-600";
  if (rank <= 6) return "bg-amber-500/15 text-amber-600";
  return "bg-rose-500/15 text-rose-600";
}

export default function TraderConsoleDashboard() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"Standard" | "Lite" | "Strict Risk" | "Power User">("Standard");
  const [vol, setVol] = useState<"HOT" | "WARM" | "ICY">("WARM");
  const [sheet, setSheet] = useState<string>(sampleSheets[0].id);
  const [addOpen, setAddOpen] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [newSheetUrl, setNewSheetUrl] = useState("");
  const [newSheetRange, setNewSheetRange] = useState("Portfolio!A1:Q");

  const filtered = useMemo(() => {
    if (!query) return samplePositions;
    return samplePositions.filter(r => r.ticker.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const currentSheet = sampleSheets.find(s => s.id === sheet);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-[1250px] px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Trader Console</h1>
            <p className="text-sm text-muted-foreground">Sheets • Watchlist • Heat Monitor • Portfolio • Ideas</p>
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

        {/* Sheet manager + Command bar */}
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="rounded-2xl md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><SheetIcon className="h-4 w-4"/> Sheets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={sheet} onValueChange={setSheet}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose a sheet" />
                </SelectTrigger>
                <SelectContent>
                  {sampleSheets.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Range: {currentSheet?.range}</div>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-xl" onClick={() => setAddOpen(true)}><PlusCircle className="h-4 w-4 mr-2"/>Add sheet</Button>
                <Button size="sm" variant="outline" className="rounded-xl">Sync now</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl md:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-base">Command bar</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2 rounded-2xl border bg-background p-2 shadow-sm">
              <Search className="h-4 w-4 ml-2"/>
              <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Type a command… e.g., Need A Trade (Standard) | Build tickets" className="border-0 focus-visible:ring-0"/>
              <Button className="rounded-xl"><Play className="h-4 w-4 mr-2"/>Run</Button>
            </CardContent>
          </Card>
        </div>

        {/* HEAT MONITOR — most important section */}
        <Card className="rounded-2xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Layers3 className="h-4 w-4"/> Heat Monitor & Trim/Hedge System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="rounded-xl">
                <CardHeader className="pb-1"><CardTitle className="text-sm">Signal</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5"/> {vol}</div>
                  <div className="text-xs text-muted-foreground">VIX term: contango · VVIX 92 · Put/Call 0.81</div>
                </CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardHeader className="pb-1"><CardTitle className="text-sm">Stretch Flags</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div>QQQ — <Badge variant="outline">RSI≥70 & ≥20‑SMA+2×ATR</Badge></div>
                  <div>HOOD — <Badge variant="secondary">Near trigger</Badge></div>
                </CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardHeader className="pb-1"><CardTitle className="text-sm">What to do</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="rounded-xl">Trim stretch (prep tickets)</Button>
                  <Button size="sm" variant="outline" className="rounded-xl">Tighten stops (top risk)</Button>
                  <Button size="sm" className="rounded-xl" variant="secondary">Prepare Hedge Pack</Button>
                </CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardHeader className="pb-1"><CardTitle className="text-sm">Risk Snapshot</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">6.3% NAV</div>
                  <div className="text-xs text-muted-foreground">Worst‑case to stops (≤ 7%)</div>
                </CardContent>
              </Card>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium mb-2">Sector Rotation Heat‑map</div>
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
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Upcoming catalysts (7–10d)</div>
                <Card className="rounded-xl">
                  <CardContent className="p-3">
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
            </div>
          </CardContent>
        </Card>

        {/* PORTFOLIO MONITOR */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-base">Portfolio Monitor</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-2 text-left">Ticker</th>
                    <th className="py-2 text-right">Last</th>
                    <th className="py-2 text-right">%‑to‑Stop</th>
                    <th className="py-2 text-right">RSI‑14</th>
                    <th className="py-2 text-right">ATR‑14</th>
                    <th className="py-2 text-left">Notes</th>
                    <th className="py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.ticker} className="border-t">
                      <td className="py-2 font-medium">{r.ticker}</td>
                      <td className="py-2 text-right">{typeof r.last === "number" ? r.last.toFixed(2) : r.last}</td>
                      <td className="py-2 text-right">{typeof r.pctToStop === "number" ? `${r.pctToStop.toFixed(1)}%` : r.pctToStop}</td>
                      <td className="py-2 text-right">{r.rsi}</td>
                      <td className="py-2 text-right">{r.atr}</td>
                      <td className="py-2">{r.notes}</td>
                      <td className="py-2 text-center">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="rounded-xl">Tighten stop</Button>
                          <Button size="sm" variant="ghost" className="rounded-xl">Details</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* WATCHLIST + IDEAS */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl md:col-span-1">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ListPlus className="h-4 w-4"/> Watchlist</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {watchlist.map(w => (
                <div key={w.ticker} className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <div className="font-medium">{w.ticker} <Badge variant="secondary" className="ml-2">{w.tag}</Badge></div>
                    <div className="text-xs text-muted-foreground">{w.note}</div>
                  </div>
                  <div className="text-xs">Score {w.score}</div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="rounded-xl w-full mt-2"><Plus className="h-4 w-4 mr-2"/>Add to watchlist</Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl md:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-base">Idea Finder</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="core">
                <TabsList className="rounded-xl">
                  <TabsTrigger value="core">Core</TabsTrigger>
                  <TabsTrigger value="garp">GARP</TabsTrigger>
                  <TabsTrigger value="swing">Swing</TabsTrigger>
                  <TabsTrigger value="moonshot">Moonshot</TabsTrigger>
                </TabsList>
                {(["core","garp","swing","moonshot"] as const).map(tab => (
                  <TabsContent key={tab} value={tab} className="mt-3 space-y-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border p-3">
                        <div className="text-sm">
                          <span className="font-medium mr-2">{tab.toUpperCase()}‑{i}</span>
                          Candidate blurb • PEG, ROIC, ROC signals
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="rounded-xl">Details</Button>
                          <Button size="sm" className="rounded-xl">Build ticket</Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* ORDERS */}
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

        {/* Add Sheet dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add a Google Sheet</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Input value={newSheetName} onChange={(e)=>setNewSheetName(e.target.value)} placeholder="Display name (e.g., Main Portfolio)"/>
              <Input value={newSheetUrl} onChange={(e)=>setNewSheetUrl(e.target.value)} placeholder="Sheet URL (or ID)"/>
              <Input value={newSheetRange} onChange={(e)=>setNewSheetRange(e.target.value)} placeholder="Named range (e.g., Portfolio!A1:Q)"/>
              <div className="text-xs text-muted-foreground">We’ll store the ID and range; share the sheet read‑only with the service account.</div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={()=>setAddOpen(false)}>Cancel</Button>
              <Button onClick={()=>setAddOpen(false)}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
