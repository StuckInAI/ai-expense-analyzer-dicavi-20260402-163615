'use client'

import { FileText, CheckSquare, MessageSquare, Users, Settings, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'
import Image from 'next/image'

interface SidebarProps {
  activeView: 'document' | 'tasks' | 'chat'
  setActiveView: (view: 'document' | 'tasks' | 'chat') => void
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ activeView, setActiveView, isOpen, onToggle }: SidebarProps) {
  const { state } = useWorkspace()
  const onlineCount = state.users.filter(u => u.isOnline).length
  const unreadMessages = state.messages.filter(
    m => m.userId !== 'user-1' && new Date(m.timestamp) > new Date(Date.now() - 1000 * 60)
  ).length

  const navItems = [
    {
      id: 'document' as const,
      label: 'Document',
      icon: FileText,
      badge: null,
      description: 'Collaborative editor',
    },
    {
      id: 'tasks' as const,
      label: 'Tasks',
      icon: CheckSquare,
      badge: state.tasks.filter(t => t.status !== 'done').length,
      description: 'Kanban board',
    },
    {
      id: 'chat' as const,
      label: 'Chat',
      icon: MessageSquare,
      badge: unreadMessages > 0 ? unreadMessages : null,
      description: 'Team messages',
    },
  ]

  return (
    <aside
      className={`flex flex-col bg-workspace-card border-r border-workspace-border transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-workspace-border">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">WorkSpace</p>
              <p className="text-xs text-slate-500">Live Collab</p>
            </div>
          </div>
        )}
        {!isOpen && (
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-workspace-hover text-slate-400 hover:text-slate-200 transition-colors"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Online Status */}
      {isOpen && (
        <div className="px-4 py-3 border-b border-workspace-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
            <span className="text-xs text-slate-400">
              {onlineCount} member{onlineCount !== 1 ? 's' : ''} online
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
              activeView === item.id
                ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-workspace-hover'
            }`}
          >
            <div className="relative flex-shrink-0">
              <item.icon className="w-5 h-5" />
              {item.badge !== null && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            {isOpen && (
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-slate-500 group-hover:text-slate-400">{item.description}</p>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-2 border-t border-workspace-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-workspace-hover transition-colors">
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-sm">Settings</span>}
        </button>

        {isOpen && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-workspace-hover">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              YO
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">You</p>
              <p className="text-xs text-emerald-400">● Active</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
