'use client'

import { useState } from 'react'
import { Circle, Eye, Edit3, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { formatDistanceToNow } from 'date-fns'

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-emerald-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  yellow: 'bg-yellow-500',
}

const RING_MAP: Record<string, string> = {
  blue: 'ring-blue-500',
  purple: 'ring-purple-500',
  green: 'ring-emerald-500',
  orange: 'ring-orange-500',
  pink: 'ring-pink-500',
  yellow: 'ring-yellow-500',
}

const VIEW_ICONS: Record<string, React.ElementType> = {
  document: Edit3,
  tasks: Eye,
  chat: MessageSquare,
}

export default function ActiveUsers() {
  const { state } = useWorkspace()
  const [collapsed, setCollapsed] = useState(false)

  const onlineUsers = state.users.filter(u => u.isOnline)
  const offlineUsers = state.users.filter(u => !u.isOnline)

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 px-2 border-l border-workspace-border bg-workspace-card gap-3">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1 rounded hover:bg-workspace-hover text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {onlineUsers.map(user => (
          <div
            key={user.id}
            title={user.name}
            className={`w-8 h-8 rounded-full ${COLOR_MAP[user.color]} flex items-center justify-center text-xs font-bold text-white ring-2 ${RING_MAP[user.color]} ring-offset-2 ring-offset-workspace-bg`}
          >
            {user.avatar}
          </div>
        ))}
      </div>
    )
  }

  return (
    <aside className="w-56 flex-shrink-0 border-l border-workspace-border bg-workspace-card flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-workspace-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Team</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
            {onlineUsers.length} online
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded hover:bg-workspace-hover text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Online users */}
        {onlineUsers.map(user => {
          const ViewIcon = VIEW_ICONS[user.currentView || 'document'] || Eye
          return (
            <div
              key={user.id}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-workspace-hover transition-colors group"
            >
              <div className="relative flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full ${COLOR_MAP[user.color]} flex items-center justify-center text-xs font-bold text-white`}
                >
                  {user.avatar}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-workspace-card" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {user.id === 'user-1' ? 'You' : user.name}
                </p>
                <div className="flex items-center gap-1">
                  <ViewIcon className="w-3 h-3 text-slate-500" />
                  <p className="text-xs text-slate-500 capitalize">
                    {user.currentView || 'document'}
                  </p>
                  {user.isTyping && (
                    <div className="typing-indicator flex items-center ml-1">
                      <span className="bg-slate-400 w-1 h-1" />
                      <span className="bg-slate-400 w-1 h-1" />
                      <span className="bg-slate-400 w-1 h-1" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Offline users */}
        {offlineUsers.length > 0 && (
          <>
            <div className="px-2 py-1 mt-3">
              <p className="text-xs text-slate-600 uppercase tracking-wider">Offline</p>
            </div>
            {offlineUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg opacity-50"
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full ${COLOR_MAP[user.color]} flex items-center justify-center text-xs font-bold text-white grayscale`}
                  >
                    {user.avatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-slate-600 rounded-full border-2 border-workspace-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-400 truncate">{user.name}</p>
                  <p className="text-xs text-slate-600">
                    {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-workspace-border">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
          <span>Live sync active</span>
        </div>
      </div>
    </aside>
  )
}
