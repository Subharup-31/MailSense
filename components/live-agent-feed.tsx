"use client"

import { useState, useEffect } from "react"

const AGENT_TYPES = [
  { name: "gmail-fetch", task: "Fetching unread email threads from Gmail", icon: "" },
  { name: "vector-search", task: "Searching Pinecone for similar email pairs", icon: "" },
  { name: "mistral-generate", task: "Generating reply draft with Mistral AI", icon: "" },
  { name: "evaluation-score", task: "Scoring draft across 11 quality metrics", icon: "" },
  { name: "rule-check", task: "Running deterministic rule validation", icon: "" },
  { name: "self-correct", task: "Rewriting draft based on critique feedback", icon: "" },
  { name: "gmail-save", task: "Saving evaluated draft to Gmail Drafts", icon: "" },
  { name: "audit-log", task: "Logging evaluation results to Supabase", icon: "" },
]

function useAnimatedCount(target: number, speed = 80) {
  const [count, setCount] = useState(target - 10)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => {
      setCount((c) => {
        const delta = Math.random() < 0.5 ? 1 : -1
        const next = c + delta
        return Math.max(target - 30, Math.min(target + 10, next))
      })
    }, speed + Math.random() * 200)
    return () => clearInterval(id)
  }, [target, speed])
  
  return mounted ? count : target - 10
}

export function LiveEvalCounter() {
  const count = useAnimatedCount(3847)
  return (
    <span
      className="text-5xl md:text-6xl font-light tracking-tight text-[#111]"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
    >
      {count.toLocaleString()}
    </span>
  )
}

interface AgentLog {
  id: number
  agent: string
  task: string
  icon: string
  status: "running" | "done"
  elapsed: string
}

let idCounter = 100

export function LiveEvalFeed() {
  const [logs, setLogs] = useState<AgentLog[]>(() =>
    AGENT_TYPES.slice(0, 5).map((a, i) => ({
      id: i,
      agent: a.name,
      task: a.task,
      icon: a.icon,
      status: i < 3 ? "running" : "done",
      elapsed: `${i * 2 + 1}m ${Math.floor(Math.random() * 59)}s`,
    }))
  )

  useEffect(() => {
    const id = setInterval(() => {
      const pick = AGENT_TYPES[Math.floor(Math.random() * AGENT_TYPES.length)]
      const newLog: AgentLog = {
        id: ++idCounter,
        agent: pick.name,
        task: pick.task,
        icon: pick.icon,
        status: "running",
        elapsed: "just now",
      }
      setLogs((prev) => [newLog, ...prev].slice(0, 6))
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-black/[0.06] flex items-center justify-between">
        <span className="text-[10px] tracking-widest text-black/30 uppercase font-mono">Live Feed</span>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      </div>
      <div className="divide-y divide-black/[0.04]">
        {logs.map((log, i) => (
          <div
            key={log.id}
            className="flex items-start gap-3 px-5 py-3.5"
            style={{
              animation: i === 0 ? "fadeInUp 0.4s ease both" : undefined,
            }}
          >
            <div className="w-8 h-8 rounded-lg border border-black/[0.08] flex items-center justify-center text-black/40 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a10 10 0 0 1 10 10H12V2z"/>
                <path d="M12 12 2 12A10 10 0 0 0 12 22V12z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-mono text-black/40 mb-0.5">{log.agent}</div>
              <div className="text-xs text-black/65 leading-snug truncate">{log.task}</div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className={`text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded-full ${
                  log.status === "running"
                    ? "bg-blue-50 text-blue-500"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {log.status}
              </span>
              <span className="text-[9px] text-black/25 font-mono">{log.elapsed}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
