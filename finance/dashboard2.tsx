<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Weekly Humble-Check Dashboard (Standalone)</title>

  <!-- Tailwind via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    // Tailwind tweak: add a couple of tokens to mimic the original palette
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            background: 'rgb(255 255 255)',
            muted: {
              DEFAULT: 'rgb(243 244 246)',
              foreground: 'rgb(107 114 128)'
            }
          },
          borderRadius: {
            '2xl': '1rem'
          }
        }
      }
    }
  </script>
  <style>
    /* Simple utility alias to match your original class naming */
    .text-muted-foreground { color: rgb(107,114,128); }
  </style>

  <!-- React + ReactDOM + Babel (for in-browser JSX) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-gray-50">
  <div id="root"></div>

  <script type="text/babel">
    const { useMemo, useState } = React;

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

    function colorByROC(rank) {
      if (rank <= 3) return "bg-emerald-500/15 text-emerald-600";
      if (rank <= 6) return "bg-amber-500/15 text-amber-600";
      return "bg-rose-500/15 text-rose-600";
    }

    // --- Tiny UI atoms (Tailwind-only) ---
    const Card = ({ children, className = "" }) => (
      <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>{children}</div>
    );
    const CardHeader = ({ children, className = "" }) => (
      <div className={`px-4 pt-4 ${className}`}>{children}</div>
    );
    const CardTitle = ({ children, className = "" }) => (
      <h3 className={`text-base font-semibold ${className}`}>{children}</h3>
    );
    const CardContent = ({ children, className = "" }) => (
      <div className={`px-4 pb-4 ${className}`}>{children}</div>
    );

    const Badge = ({ children, variant = "outline", className = "" }) => {
      const base = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border";
      const style =
        variant === "outline" ? "border-gray-300 text-gray-700 bg-white" :
        variant === "secondary" ? "border-transparent bg-gray-100 text-gray-700" :
        variant === "destructive" ? "border-transparent bg-rose-600 text-white" :
        "border-gray-300 text-gray-700 bg-white";
      return <span className={`${base} ${style} ${className}`}>{children}</span>;
    };

    const Button = ({ children, variant="solid", size="md", className="", ...props }) => {
      const base = "inline-flex items-center justify-center gap-2 rounded-xl border font-medium";
      const style =
        variant === "outline" ? "bg-white text-black border-gray-300" :
        variant === "ghost" ? "border-transparent text-gray-600 hover:bg-gray-50" :
        "bg-black text-white border-black";
      const sizing = size === "sm" ? "text-sm px-3 py-2" : "px-4 py-2";
      return <button className={`${base} ${style} ${sizing} ${className}`} {...props}>{children}</button>;
    };

    function Tabs({ tabs, value, onChange }) {
      return (
        <div>
          <div className="inline-flex rounded-xl border bg-white p-1">
            {tabs.map(t => (
              <button
                key={t.value}
                className={`px-3 py-1.5 text-sm rounded-lg ${value === t.value ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
                onClick={() => onChange(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    function DashboardMock() {
      const [query, setQuery] = useState("");
      const [mode, setMode] = useState("Standard");
      const [vol, setVol] = useState("WARM");
      const [tab, setTab] = useState("parked");

      const filtered = useMemo(() => {
        if (!query) return samplePositions;
        return samplePositions.filter(r => r.ticker.toLowerCase().includes(query.toLowerCase()));
      }, [query]);

      return (
        <div className="mx-auto max-w-[1200px] px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Weekly Humble-Check Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                After U.S. close · Stretch universe:&nbsp;
                {stretchUniverse.map((s, idx) => (
                  <Badge key={s + idx} variant="outline" className="mx-1">{s}</Badge>
                ))}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border text-white ${vol === "HOT" ? "bg-emerald-600 border-emerald-600" : vol === "WARM" ? "bg-amber-600 border-amber-600" : "bg-rose-600 border-rose-600"}`}>{vol}</span>
              <select
                className="rounded-xl border px-3 py-2 text-sm"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option>Standard</option>
                <option>Lite</option>
                <option>Strict Risk</option>
                <option>Power User</option>
              </select>
              <Button variant="outline" size="sm">
                <span className="inline-block w-4 h-4 border border-gray-700 rounded-sm mr-2"></span>
                Settings
              </Button>
            </div>
          </div>

          {/* Command bar */}
          <div className="flex items-center gap-2 rounded-2xl border bg-background p-2 shadow-sm">
            <span className="ml-2 text-gray-500">⌕</span>
            <input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              placeholder="Type a command or filter tickers… e.g., Need A Trade (Standard)"
              className="w-full rounded-xl border-0 px-3 py-2 text-sm focus:outline-none focus:ring-0"
            />
            <Button className="rounded-xl">
              ▶ Run
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle>Portfolio NAV</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">$1,342,900</div>
                <div className="text-xs text-muted-foreground">Pace-to-Goal: <span className="font-medium">ON</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle>Free Cash</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">$62,400</div>
                <div className="text-xs text-muted-foreground">Floor: $15k · Gate: $25k</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle>Risk Envelope</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">6.3% NAV</div>
                <div className="text-xs text-muted-foreground">Worst-case to stops (≤ 7%)</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle>Vol Regime</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded-sm border"></span> {vol}
                </div>
                <div className="text-xs text-muted-foreground">VIX term: contango · VVIX 92</div>
              </CardContent>
            </Card>
          </div>

          {/* Deltas Table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle>1) Dashboard refresh — Deltas since last Fri</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr className="text-left">
                      <th className="py-2">Ticker</th>
                      <th className="py-2 text-right">Last</th>
                      <th className="py-2 text-right">%-to-Stop</th>
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

          {/* Stretch-Scan & Rotation */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle>2) Stretch-Scan (HOOD, QQQ, VGT, ARKK)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <div className="font-medium">QQQ</div>
                    <Badge variant="outline">RSI 71 · ≥ 20-SMA + 2×ATR</Badge>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">Trim 15%</Button>
                      <Button size="sm" variant="ghost">Why ▶</Button>
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

            <Card>
              <CardHeader className="pb-2"><CardTitle>3) Momentum / Rotation — Sector heat-map</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                      <tr className="text-left">
                        <th className="py-2">Sector</th>
                        <th className="py-2 text-right">ROC-20d</th>
                        <th className="py-2 text-right">ROC-50d</th>
                        <th className="py-2 text-right">ROC-100d</th>
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

          {/* Heat-Alert + Cash + Catalysts */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">4) Heat-Alert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Layer-1:</strong> None flagged</div>
                <div><strong>Layer-2:</strong> VIX 20.8 (no trigger)</div>
                <Button size="sm" variant="outline" className="rounded-xl mt-2">Prep Hedge Pack</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle>5) Cash check</CardTitle></CardHeader>
              <CardContent className="text-sm">
                Free cash $62,400 (≥ $15k).
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-xl">Raise cash</Button>
                  <Button size="sm" className="rounded-xl">Deploy cash</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">6) Upcoming catalysts (7–10d)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  {catalysts.map(c => (
                    <li key={c.ticker + c.date} className="flex items-center justify-between">
                      <span>{c.date} · {c.ticker} · {c.type}</span>
                      {c.tMinus2 && <Badge variant="destructive">T-2 tighten</Badge>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Orders */}
          <Card>
            <CardHeader className="pb-2"><CardTitle>Orders</CardTitle></CardHeader>
            <CardContent>
              <Tabs
                tabs={[
                  { value: "parked", label: "Draft (PARKED)" },
                  { value: "armed", label: "Armed" },
                  { value: "filled", label: "Filled" },
                ]}
                value={tab}
                onChange={setTab}
              />
              {tab === "parked" && (
                <div className="mt-3 space-y-2">
                  {ordersParked.map(o => (
                    <div key={o.id} className="flex items-center justify-between rounded-xl border p-3">
                      <div className="text-sm">
                        <span className="font-medium mr-2">{o.id})</span>{o.text} <span className="text-muted-foreground">· {o.risk}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => navigator.clipboard.writeText(o.text)}
                        >
                          Copy
                        </Button>
                        <Button size="sm" className="rounded-xl">Arm</Button>
                        <Button size="sm" variant="ghost" className="rounded-xl">Park</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tab === "armed" && (
                <div className="mt-3 space-y-2">
                  {ordersArmed.map(o => (
                    <div key={o.id} className="flex items-center justify-between rounded-xl border p-3">
                      <div className="text-sm"><span className="font-medium mr-2">{o.id})</span>{o.text}</div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="rounded-xl">Pause</Button>
                        <Button size="sm" className="rounded-xl">Fire</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tab === "filled" && (
                <div className="mt-3 text-sm text-muted-foreground">No fills in this demo.</div>
              )}
            </CardContent>
          </Card>

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">© 2025 — Stops Engine · Humble-Check · Order Builder</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  const text = document.body.innerText;
                  navigator.clipboard.writeText(text);
                }}
              >
                Copy report
              </Button>
              <Button className="rounded-xl">＋ Build tickets</Button>
            </div>
          </div>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(<DashboardMock />);
  </script>
</body>
</html>
