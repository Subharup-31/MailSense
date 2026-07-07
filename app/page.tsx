"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { IntroAnimation, HERO_REVEAL_MS } from "@/components/intro-animation"
import { PixelIcon } from "@/components/pixel-icon"
import { LiveEvalFeed, LiveEvalCounter } from "@/components/live-agent-feed"
import { RevealText } from "@/components/reveal-text"
import { MailSenseFeatureCards } from "@/components/stacking-agent-cards"
import { MobileNav } from "@/components/mobile-nav"
import Link from "next/link"

// ─── Intersection Observer hook ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── Bento card ──────────────────────────────────────────────────────────────
function BentoCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-black/[0.07] bg-white overflow-hidden transition-all duration-700 hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)" }}
      />
      {children}
    </div>
  )
}

// ─── Pill tag ─────────────────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

// ─── Metric bar ───────────────────────────────────────────────────────────────
function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-black/50">{label}</span>
        <span className="text-black/70 font-light">{value}%</span>
      </div>
      <div className="w-full bg-black/[0.05] h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{
            width: inView ? `${value}%` : "0%",
            transition: "width 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s",
          }}
        />
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MailSensePage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [heroReady, setHeroReady] = useState(false)

  const handleIntroDone = useCallback(() => setHeroReady(true), [])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }

  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">

      <IntroAnimation onDone={handleIntroDone} />
      <MobileNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden flex flex-col">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-[15%] w-[600px] h-[600px] rounded-full bg-indigo-100/40 blur-[120px]" />
          <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-violet-100/30 blur-[100px]" />
          <div className="absolute bottom-[20%] left-[30%] w-[500px] h-[500px] rounded-full bg-blue-50/40 blur-[100px]" />
        </div>

        {/* Nav spacer */}
        <div className="h-16 shrink-0" />

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-20">
          <div className="max-w-5xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 text-[11px] font-medium tracking-wide mb-8"
              style={{
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.6s ease 0ms, transform 0.6s ease 0ms",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              AI-Powered Gmail Intelligence
            </div>

            {/* Title */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#111] leading-tight tracking-tight mb-8"
              style={{
                fontFamily: '"IBM Plex Sans", sans-serif',
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(20px)",
                transform: heroReady ? "translateY(0px)" : "translateY(28px)",
                transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 80ms, filter 1s cubic-bezier(0.16,1,0.3,1) 80ms, transform 1s cubic-bezier(0.16,1,0.3,1) 80ms",
              }}
            >
              Draft perfect<br />
              email replies,<br />
              <span className="text-indigo-600">evaluated by AI.</span>
            </h1>

            {/* Sub */}
            <p
              className="text-base sm:text-lg text-black/45 leading-relaxed max-w-xl mb-10"
              style={{
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.8s ease 200ms, transform 0.8s ease 200ms",
              }}
            >
              MailSense reads your Gmail, generates context-aware replies using Mistral AI, then scores every draft through a deterministic evaluation suite before saving it as a ready-to-send Gmail draft.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3"
              style={{
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.8s ease 320ms, transform 0.8s ease 320ms",
              }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#111] text-white text-sm tracking-widest hover:bg-[#333] transition-colors"
              >
                Start Free Trial
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-black/10 text-black/60 text-sm tracking-widest hover:border-black/25 hover:text-black transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* Hero stats */}
            <div
              className="flex flex-wrap gap-10 mt-14"
              style={{
                opacity: heroReady ? 1 : 0,
                transition: "opacity 0.8s ease 450ms",
              }}
            >
              {[
                { value: "80%+", label: "Evaluation threshold" },
                { value: "11", label: "Quality metrics scored" },
                { value: "2×", label: "Self-correction loops" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl sm:text-4xl font-light text-[#111] tracking-tight" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{s.value}</div>
                  <div className="text-xs text-black/35 tracking-widest uppercase mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mock console floating right */}
        <div
          className="absolute right-6 md:right-12 lg:right-20 top-1/2 -translate-y-1/2 w-[340px] hidden xl:block z-10"
          style={{
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(20px)",
            transition: "opacity 1s ease 600ms, transform 1s ease 600ms",
          }}
        >
          <div className="rounded-2xl border border-black/[0.08] bg-white/80 overflow-hidden" style={{ backdropFilter: "blur(20px)" }}>
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-black/[0.06]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-black/30 uppercase">Live Evaluation</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Intent Alignment", val: 97, color: "bg-indigo-500" },
                { label: "Grounding Accuracy", val: 94, color: "bg-emerald-500" },
                { label: "No Hallucination", val: 100, color: "bg-violet-500" },
                { label: "Professionalism", val: 96, color: "bg-blue-500" },
                { label: "Rule Engine", val: 88, color: "bg-amber-500" },
              ].map((m) => (
                <MetricBar key={m.label} label={m.label} value={m.val} color={m.color} />
              ))}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-black/25 font-mono">OVERALL SCORE</span>
                <span className="text-lg font-light text-emerald-600">0.947</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-emerald-700 font-medium">PASSED — Saving as Gmail Draft</span>
              </div>
              <div className="pt-3 border-t border-black/[0.04] space-y-2">
                <div className="flex items-center justify-between text-[9px] text-black/30 font-mono">
                  <span>THREAD ID</span>
                  <span>18f4a2c</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-black/30 font-mono">
                  <span>MODEL</span>
                  <span>Mistral-7B</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-black/30 font-mono">
                  <span>RETRY</span>
                  <span>0/2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4"><Tag>HOW IT WORKS</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-tight">
              {"From inbox to perfect reply\nin four automated steps."}
            </RevealText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3" onMouseMove={handleMouse}>
            {[
              {
                n: "01",
                title: "Fetch",
                desc: "MailSense connects to Gmail via Composio OAuth and pulls your most recent unread threads automatically.",
                delay: 0,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                ),
              },
              {
                n: "02",
                title: "Retrieve",
                desc: "Pinecone vector search finds the top-3 most similar email pairs from your dataset to use as few-shot context.",
                delay: 80,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                ),
              },
              {
                n: "03",
                title: "Generate",
                desc: "Mistral AI drafts a professional reply using your active prompt template, few-shot examples, and tone policy.",
                delay: 140,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a10 10 0 0 1 10 10H12V2z"/><path d="M12 12 2 12A10 10 0 0 0 12 22V12z"/><circle cx="12" cy="12" r="3"/></svg>
                ),
              },
              {
                n: "04",
                title: "Evaluate",
                desc: "11 metrics — BLEU, ROUGE, BERTScore, LLM Judge + 8 deterministic rules — score the draft. Fails trigger a self-correction loop.",
                delay: 200,
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                ),
              },
            ].map((step) => (
              <BentoCard key={step.n} className="flex flex-col min-h-[280px]" delay={step.delay}>
                <div className="p-7">
                  <div className="flex items-start justify-between mb-6">
                    <span className="font-pixel text-[11px] text-black/20 tracking-widest">{step.n}</span>
                    <div className="w-9 h-9 rounded-lg border border-black/[0.08] flex items-center justify-center text-black/40">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-light mb-3">{step.title}</h3>
                  <p className="text-sm text-black/45 leading-relaxed">{step.desc}</p>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVALUATION ENGINE ─────────────────────────────────────────────── */}
      <section id="evaluation" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="platform" size={40} />
              <div className="mt-4"><Tag>EVALUATION ENGINE</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-tight">
                {"11 metrics. Zero\nguessing. Always."}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">
              Every reply is scored across lexical, semantic, and qualitative dimensions before it ever reaches your drafts folder.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-3" onMouseMove={handleMouse}>
            {/* Lexical metrics */}
            <BentoCard className="col-span-12 md:col-span-4 p-8" delay={0}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5 text-black/40">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Lexical Metrics</h3>
              <p className="text-sm text-black/45 leading-relaxed mb-5">Pure token-overlap measures to catch word-level drift.</p>
              <div className="space-y-2">
                {["BLEU-4 n-gram precision", "ROUGE-L longest common subsequence", "METEOR stem alignment"].map(m => (
                  <div key={m} className="flex items-center gap-2 text-xs text-black/45">
                    <div className="w-1 h-1 rounded-full bg-black/20 shrink-0" />
                    {m}
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Semantic metrics */}
            <BentoCard className="col-span-12 md:col-span-4 p-8" delay={80}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5 text-black/40">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Semantic Metrics</h3>
              <p className="text-sm text-black/45 leading-relaxed mb-5">Embedding-based similarity for deep meaning alignment.</p>
              <div className="space-y-2">
                {["BERTScore token-level F1", "Cosine sentence similarity", "Local WASM embeddings (Xenova)"].map(m => (
                  <div key={m} className="flex items-center gap-2 text-xs text-black/45">
                    <div className="w-1 h-1 rounded-full bg-black/20 shrink-0" />
                    {m}
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* LLM Judge */}
            <BentoCard className="col-span-12 md:col-span-4 p-8" delay={120}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5 text-black/40">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a10 10 0 0 1 10 10H12V2z"/><path d="M12 12 2 12A10 10 0 0 0 12 22V12z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">LLM Judge</h3>
              <p className="text-sm text-black/45 leading-relaxed mb-5">Mistral grades qualitative dimensions no metric can see.</p>
              <div className="space-y-2">
                {["Intent alignment", "Completeness & grounding", "Hallucination detection", "Professionalism & safety"].map(m => (
                  <div key={m} className="flex items-center gap-2 text-xs text-black/45">
                    <div className="w-1 h-1 rounded-full bg-black/20 shrink-0" />
                    {m}
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Rule engine — full width */}
            <BentoCard className="col-span-12 p-8 md:p-10" delay={160}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5 text-black/40">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <h3 className="text-lg font-light mb-2">Deterministic Rule Engine</h3>
                  <p className="text-sm text-black/45 leading-relaxed">
                    8 hard rules that every generated reply must pass — no exceptions. Violations trigger an automatic critique-and-rewrite loop.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "✓ Correct dates only",
                    "✓ No fabricated names",
                    "✓ Numbers verified",
                    "✓ Attachments consistent",
                    "✓ All questions addressed",
                    "✓ Action items present",
                    "✓ No redundant questions",
                    "✓ No verbatim repetition",
                  ].map(r => (
                    <div key={r} className="flex items-center gap-2 text-xs text-black/50 bg-black/[0.02] rounded-lg px-3 py-2">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── SELF-CORRECTION LOOP ──────────────────────────────────────────── */}
      <section id="self-correction" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4"><Tag>SELF-CORRECTION</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-tight">
                {"Fails automatically.\nFixes itself."}
              </RevealText>
              <p className="mt-6 text-sm text-black/45 leading-relaxed max-w-sm">
                When a draft scores below 0.80, MailSense generates a structured critique, rewrites the reply, and re-evaluates — up to 2 times — before giving up or passing.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { step: "1.", label: "Score below threshold (0.80)", desc: "Evaluator flags failed metrics and rule violations" },
                  { step: "2.", label: "Critique generated", desc: "LLM writes structured feedback on exactly what failed" },
                  { step: "3.", label: "Response rewritten", desc: "Draft is regenerated incorporating the critique" },
                  { step: "4.", label: "Re-evaluated", desc: "Full evaluation runs again. Pass → saved to Gmail Drafts" },
                ].map(s => (
                  <div key={s.step} className="flex gap-4">
                    <span className="font-pixel text-[10px] text-black/25 tracking-widest mt-0.5 shrink-0 w-5">{s.step}</span>
                    <div>
                      <div className="text-sm font-light mb-0.5">{s.label}</div>
                      <div className="text-xs text-black/35">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — pipeline visual */}
            <div className="space-y-2">
              {[
                { label: "Draft generated", status: "done", score: null },
                { label: "Evaluating — 11 metrics", status: "done", score: null },
                { label: "Score: 0.71 — FAILED", status: "fail", score: "0.71" },
                { label: "Generating critique…", status: "processing", score: null },
                { label: "Rewriting draft (attempt 1)", status: "done", score: null },
                { label: "Re-evaluating…", status: "done", score: null },
                { label: "Score: 0.94 — PASSED ✓", status: "pass", score: "0.94" },
                { label: "Saved to Gmail Drafts", status: "done", score: null },
              ].map((row, i) => {
                const { ref, inView } = useInView(0.05)
                return (
                  <div
                    key={i}
                    ref={ref}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-black/[0.05] bg-white"
                    style={{
                      opacity: inView ? 1 : 0,
                      transform: inView ? "translateX(0)" : "translateX(16px)",
                      transition: `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms`,
                    }}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      row.status === "pass" ? "bg-emerald-500"
                      : row.status === "fail" ? "bg-red-400"
                      : row.status === "processing" ? "bg-amber-400 animate-pulse"
                      : "bg-black/20"
                    }`} />
                    <span className="text-xs text-black/55 flex-1 font-light">{row.label}</span>
                    {row.score && (
                      <span className={`text-xs font-mono font-light ${row.status === "pass" ? "text-emerald-600" : "text-red-500"}`}>
                        {row.score}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <section id="features" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="integrations" size={40} />
            <div className="mt-4"><Tag>FEATURES</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-tight">
              {"Everything in one\nworkspace."}
            </RevealText>
          </div>

          <MailSenseFeatureCards />
        </div>
      </section>

      {/* ── LIVE EVAL FEED ────────────────────────────────────────────────── */}
      <section id="live" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <PixelIcon type="platform" size={40} />
              <div className="mt-4"><Tag>LIVE EVALUATIONS</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
                {"Scoring emails\nin real time."}
              </RevealText>
              <p className="mt-6 text-base text-black/40 leading-relaxed max-w-sm">
                Every email response that flows through MailSense is evaluated, critiqued, and refined — completely autonomously.
              </p>
              <div className="mt-10 flex items-end gap-2">
                <LiveEvalCounter />
                <span className="text-black/30 text-sm mb-1 tracking-wide">emails evaluated</span>
              </div>
            </div>
            <div>
              <LiveEvalFeed />
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <section className="py-0 border-t border-black/[0.06] overflow-hidden select-none">
        <div className="flex border-b border-black/[0.06]" style={{ animation: "marqueeLeft 30s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["Intent Alignment", "BERTScore", "ROUGE-L", "BLEU-4", "METEOR", "Hallucination Detection", "Grounding", "Professionalism", "Safety", "Rule Engine"].map((cap) => (
                <div key={cap} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                  <span className="text-sm text-black/45 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex" style={{ animation: "marqueeRight 24s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["Gmail OAuth", "Composio", "Pinecone Vector Search", "Mistral AI", "Supabase Postgres", "ONNX Transformers.js", "Few-Shot RAG", "Self-Correction Loop", "Prompt Versioning", "Audit Logs"].map((cap) => (
                <div key={cap} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                  <span className="text-sm text-black/30 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-indigo-100/30 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-6">
            Ship better email replies,<br />starting today.
          </h2>
          <p className="text-sm text-black/45 leading-relaxed mb-10">
            Connect your Gmail, upload your dataset, and let MailSense generate, score, and save production-grade replies automatically.
          </p>
          {!submitted ? (
            <form
              onSubmit={e => { e.preventDefault(); if (email) setSubmitted(true) }}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/25 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest"
              >
                GET EARLY ACCESS
              </button>
            </form>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-600/20 bg-emerald-50 text-emerald-700 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {"You're on the list. We'll reach out soon."}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="font-pixel text-xs tracking-[0.25em] text-black/50">MAILSENSE</span>
            <p className="text-[10px] text-black/25 mt-1 tracking-wide">AI Email Intelligence</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Evaluation",   href: "#evaluation" },
              { label: "Self-Correct", href: "#self-correction" },
              { label: "Features",    href: "#features" },
              { label: "Live",        href: "#live" },
            ].map(l => (
              <a key={l.label} href={l.href} className="text-xs text-black/35 hover:text-black/70 transition-colors tracking-widest">{l.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs text-black/25 hover:text-black/55 transition-colors tracking-widest">Sign In</Link>
            <Link href="/signup" className="text-xs text-black/25 hover:text-black/55 transition-colors tracking-widest">Get Started</Link>
            <Link href="/dashboard" className="text-xs text-black/25 hover:text-black/55 transition-colors tracking-widest">Dashboard</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04]">
          <span className="text-xs text-black/20">© 2026 MailSense. Built with Next.js, Mistral AI &amp; Supabase.</span>
        </div>
      </footer>
    </div>
  )
}
