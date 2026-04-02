'use client'

import { useWorkspace } from '@/context/WorkspaceContext'
import { Bell, MessageSquare, CheckSquare, FileText, X, Users } from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  user_joined: Users,
  task_updated: CheckSquare,
  message: MessageSquare,
  document_edit: FileText,
}

const COLOR_MAP: Record<string, string> = {
  user_joined: 'text-emerald-400 bg-emerald-400/10',
  task_updated: 'text-blue-400 bg-blue-400/10',
  message: 'text-purple-400 bg-purple-400/10',
  document_edit: 'text-orange-400 bg-orange-400/10',
}

export default function NotificationToast() {
  const { state, dispatch } = useWorkspace()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {state.notifications.map(notification => {
        const Icon = ICON_MAP[notification.type] || Bell
        const colorClass = COLOR_MAP[notification.type] || 'text-slate-400 bg-slate-400/10'
        return (
          <div
            key={notification.id}
            className="notification-enter flex items-start gap-3 bg-workspace-card border border-workspace-border rounded-xl px-4 py-3 shadow-2xl pointer-events-auto max-w-sm"
          >
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 leading-snug">{notification.message}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(notification.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <button
              onClick={() =>
                dispatch({ type: 'DISMISS_NOTIFICATION', payload: notification.id })
              }
              className="p-1 rounded hover:bg-workspace-hover text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
