"use client"

import { useEffect, useRef, useState } from "react"

interface RevealTextProps {
  children: string
  className?: string
}

export function RevealText({ children, className = "" }: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const lines = children.split("\n")

  return (
    <div ref={ref} className={className}>
      {lines.map((line, li) => (
        <span key={li} className="block overflow-hidden">
          <span
            className="block"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(100%)",
              transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${li * 100}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${li * 100}ms`,
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </div>
  )
}
