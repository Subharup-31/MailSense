"use client"

export function AgentInterface() {
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-6 font-mono text-xs text-black/40 leading-relaxed">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="tracking-widest text-[10px]">AGENT INTERFACE · LIVE</span>
      </div>
      <pre className="whitespace-pre-wrap">
{`> agent.run({
    task: "Analyze Q3 data",
    tools: ["db", "charts"],
    memory: true,
  })

✓ Retrieved 4,200 rows
✓ Generated summary
✓ Plotted 3 charts
→ Report saved to /reports/q3`}
      </pre>
    </div>
  )
}
