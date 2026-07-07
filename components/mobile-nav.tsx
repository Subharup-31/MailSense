"use client"

import { useState } from "react"
import Link from "next/link"

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Evaluation",   href: "#evaluation" },
  { label: "Self-Correction", href: "#self-correction" },
  { label: "Features",     href: "#features" },
  { label: "Live Feed",    href: "#live" },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 inset-x-0 z-50">
      {/* Backdrop blur bar */}
      <div className="flex items-center justify-between h-16 px-6 md:px-12 backdrop-blur-md bg-[#F5F4F0]/80 border-b border-black/[0.06]">
        {/* Wordmark */}
        <span className="font-pixel text-xs tracking-[0.25em] text-black/50">MAILSENSE</span>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-xs text-black/40 hover:text-black/80 transition-colors tracking-widest"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#111] text-white text-xs tracking-widest hover:bg-[#333] transition-colors"
          >
            Sign in
          </Link>

          {/* Mobile burger */}
          <button
            className="md:hidden flex flex-col gap-1 p-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-5 h-px bg-black/50 transition-all duration-300"
                style={{
                  transform:
                    open && i === 0 ? "rotate(45deg) translateY(6px)"
                    : open && i === 2 ? "rotate(-45deg) translateY(-6px)"
                    : open && i === 1 ? "scaleX(0)"
                    : "none",
                }}
              />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#F5F4F0]/95 backdrop-blur-md border-b border-black/[0.06] px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-black/50 hover:text-black transition-colors tracking-widest"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#111] text-white text-xs tracking-widest hover:bg-[#333] transition-colors mt-2"
          >
            Sign in
          </Link>
        </div>
      )}
    </nav>
  )
}
