'use client'

import { useWorkspace } from '@/context/WorkspaceContext'

const CURSOR_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#a855f7',
  green: '#10b981',
  orange: '#f97316',
  pink: '#ec4899',
  yellow: '#eab308',
}

export default function LiveCursors() {
  const { state } = useWorkspace()

  const activeCursors = state.users.filter(
    u => u.isOnline && u.id !== 'user-1' && u.cursor && u.currentView === 'document'
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {activeCursors.map(user => (
        <div
          key={user.id}
          className="user-cursor"
          style={{
            left: `${user.cursor!.x}px`,
            top: `${user.cursor!.y}px`,
          }}
        >
          {/* Cursor SVG */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 2L16 10L10 11L8 18L4 2Z"
              fill={CURSOR_COLORS[user.color]}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          {/* Name tag */}
          <div
            className="absolute left-4 top-4 px-2 py-0.5 rounded-full text-xs font-semibold text-white whitespace-nowrap shadow-lg"
            style={{ backgroundColor: CURSOR_COLORS[user.color] }}
          >
            {user.name}
          </div>
        </div>
      ))}
    </div>
  )
}
