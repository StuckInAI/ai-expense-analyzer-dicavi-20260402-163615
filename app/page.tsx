'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import WorkspaceHeader from '@/components/WorkspaceHeader'
import DocumentEditor from '@/components/DocumentEditor'
import TaskBoard from '@/components/TaskBoard'
import TeamChat from '@/components/TeamChat'
import LiveCursors from '@/components/LiveCursors'
import ActiveUsers from '@/components/ActiveUsers'
import NotificationToast from '@/components/NotificationToast'
import { WorkspaceProvider } from '@/context/WorkspaceContext'

export default function Home() {
  const [activeView, setActiveView] = useState<'document' | 'tasks' | 'chat'>('document')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <WorkspaceProvider>
      <div className="flex h-screen overflow-hidden bg-workspace-bg workspace-grid">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <WorkspaceHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex flex-1 overflow-hidden relative">
            <main className="flex-1 overflow-hidden relative">
              {activeView === 'document' && <DocumentEditor />}
              {activeView === 'tasks' && <TaskBoard />}
              {activeView === 'chat' && <TeamChat />}
              <LiveCursors />
            </main>
            <ActiveUsers />
          </div>
        </div>
        <NotificationToast />
      </div>
    </WorkspaceProvider>
  )
}
