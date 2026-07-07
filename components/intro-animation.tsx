"use client"

import { useEffect, useRef, useState } from "react"

interface IntroAnimationProps {
  onDone: () => void
}

export const INTRO_DURATION_MS = 2200
export const HERO_REVEAL_MS = 1800

export function IntroAnimation({ onDone }: IntroAnimationProps) {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fade = setTimeout(() => setFadeOut(true), INTRO_DURATION_MS - 500)
    const done = setTimeout(() => {
      setVisible(false)
      onDone()
    }, INTRO_DURATION_MS)

    return () => {
      clearTimeout(fade)
      clearTimeout(done)
    }
  }, [onDone])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#F5F4F0]"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: fadeOut ? "none" : "all",
      }}
    >
      <div className="text-center">
        <div
          className="text-2xl tracking-[0.3em] text-black/30 font-pixel mb-3"
          style={{
            opacity: 1,
            animation: "word-reveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both",
          }}
        >
          MAILSENSE
        </div>
        <div
          className="text-xs tracking-widest text-black/20 uppercase"
          style={{
            animation: "word-reveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both",
            opacity: 0,
          }}
        >
          Loading…
        </div>
      </div>
    </div>
  )
}
