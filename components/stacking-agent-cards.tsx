"use client"

import { useRef, useEffect, useState } from "react"

const AGENT_CARDS = [
  {
    number: "01",
    title: "Gmail Integration",
    subtitle: "OAuth & Thread Fetching",
    description:
      "Securely connects to your Gmail via Composio OAuth, automatically pulls unread threads, and saves evaluated drafts back to your drafts folder.",
    tags: ["OAuth", "Gmail API", "Composio"],
    accent: "bg-blue-50 text-blue-600",
  },
  {
    number: "02",
    title: "Pinecone Vector Search",
    subtitle: "Few-Shot Context Retrieval",
    description:
      "Finds the top-3 most similar email pairs from your dataset using semantic search to provide relevant few-shot examples for generation.",
    tags: ["Vector DB", "RAG", "Embeddings"],
    accent: "bg-violet-50 text-violet-600",
  },
  {
    number: "03",
    title: "Mistral AI Generation",
    subtitle: "Context-Aware Drafting",
    description:
      "Generates professional email replies using your active prompt template, retrieved examples, and tone policy for consistent quality.",
    tags: ["LLM", "Mistral", "Prompting"],
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    number: "04",
    title: "Evaluation Engine",
    subtitle: "11-Metric Scoring Suite",
    description:
      "Scores every draft across BLEU, ROUGE, BERTScore, LLM Judge, and 8 deterministic rules. Fails trigger automatic self-correction.",
    tags: ["BLEU", "ROUGE", "Rules"],
    accent: "bg-amber-50 text-amber-600",
  },
]

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

export function MailSenseFeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {AGENT_CARDS.map((card, i) => (
        <AgentCard key={card.number} card={card} delay={i * 80} />
      ))}
    </div>
  )
}

function AgentCard({
  card,
  delay,
}: {
  card: (typeof AGENT_CARDS)[0]
  delay: number
}) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className="group relative rounded-2xl border border-black/[0.07] bg-white p-8 overflow-hidden hover:border-black/[0.15] hover:bg-[#fafaf8] transition-all duration-500"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      {/* Shimmer on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute top-0 -inset-x-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:translate-x-[300%] transition-transform duration-1000"
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <span className="font-pixel text-[11px] text-black/20 tracking-widest">{card.number}</span>
          <div className="flex gap-1.5">
            {card.tags.map((t) => (
              <span key={t} className={`text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-full ${card.accent}`}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <h3 className="text-xl font-light mb-1">{card.title}</h3>
        <p className="text-xs text-black/35 tracking-wide mb-4">{card.subtitle}</p>
        <p className="text-sm text-black/45 leading-relaxed">{card.description}</p>

        <div className="mt-8 flex items-center gap-2 text-xs text-black/30 group-hover:text-black/60 transition-colors">
          <span>Learn more</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
