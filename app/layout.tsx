import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, IBM_Plex_Sans, Courier_Prime } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const ibmPlexSans = IBM_Plex_Sans({ weight: ["300", "400", "500", "600"], subsets: ["latin"], variable: "--font-ibm" });
const courierPrime = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-pixel" });

export const metadata: Metadata = {
  title: 'MailSense — AI-Powered Gmail Intelligence',
  description: 'Draft perfect email replies, evaluated by AI. MailSense reads your Gmail, generates context-aware replies using Mistral AI, then scores every draft through a deterministic evaluation suite.',
  keywords: ['AI email', 'Gmail automation', 'email drafting', 'AI evaluation', 'Mistral AI', 'email intelligence'],
  authors: [{ name: 'MailSense' }],
  openGraph: {
    title: 'MailSense — AI-Powered Gmail Intelligence',
    description: 'Draft perfect email replies, evaluated by AI. MailSense reads your Gmail, generates context-aware replies using Mistral AI, then scores every draft through a deterministic evaluation suite.',
    type: 'website',
    url: 'https://mailsense.ai',
    siteName: 'MailSense',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MailSense — AI-Powered Gmail Intelligence',
    description: 'Draft perfect email replies, evaluated by AI. MailSense reads your Gmail, generates context-aware replies using Mistral AI, then scores every draft through a deterministic evaluation suite.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} ${ibmPlexSans.variable} ${courierPrime.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
