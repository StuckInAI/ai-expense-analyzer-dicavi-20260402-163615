'use client'

import { Menu, Bell, Search, Share2, Globe, Clock } from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useState, useEffect } from 'react'

interface WorkspaceHeaderProps {
  onToggleSidebar: () => void
}

export default function WorkspaceHeader({ onToggleSidebar }: WorkspaceHeaderProps) {
  const { state } = useWorkspace()
  const [time, setTime] = useState(new Date())
  const [shareTooltip, setShareTooltip] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const onlineUsers = state.users.filter(u => u.isOnline)
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500',
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-workspace-card border-b border-workspace-border">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-workspace-hover text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-workspace-hover rounded-lg">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search workspace..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-48"
          />
          <kbd className="text-xs text-slate-600 bg-workspace-border px-1.5 py-0.5 rounded">⌘K</kbd>
        </div>
      </div>

      {/* Center - Live indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
          <span className="text-xs font-medium text-emerald-400">LIVE</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Online users avatars */}
        <div className="hidden sm:flex items-center">
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 4).map(user => (
              <div
                key={user.id}
                title={user.name}
                className={`w-7 h-7 rounded-full ${colorMap[user.color]} flex items-center justify-center text-xs font-bold text-white border-2 border-workspace-card`}
              >
                {user.avatar}
              </div>
            ))}
            {onlineUsers.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-workspace-hover flex items-center justify-center text-xs font-bold text-slate-400 border-2 border-workspace-card">
                +{onlineUsers.length - 4}
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-6 bg-workspace-border hidden sm:block" />

        <button className="p-2 rounded-lg hover:bg-workspace-hover text-slate-400 hover:text-slate-200 transition-colors relative">
          <Bell className="w-5 h-5" />
          {state.notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            setShareTooltip(true)
            setTimeout(() => setShareTooltip(false), 2000)
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
          {shareTooltip && (
            <span className="absolute top-14 right-4 bg-slate-800 text-xs text-slate-200 px-2 py-1 rounded shadow-lg">
              Link copied!
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
