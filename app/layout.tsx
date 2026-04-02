import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shared WorkSpace - Live Team Collaboration',
  description: 'A real-time shared workspace for teams to collaborate, manage tasks, and communicate live.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Shared WorkSpace',
    description: 'Live team collaboration platform',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-workspace-bg text-slate-100 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
