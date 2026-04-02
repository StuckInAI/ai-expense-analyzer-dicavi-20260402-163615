'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Bold, Italic, List, Code, Hash, Eye, Edit3, Save, Users } from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'

export default function DocumentEditor() {
  const { state, dispatch, addNotification } = useWorkspace()
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [localContent, setLocalContent] = useState(state.documentContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const editingUsers = state.users.filter(
    u => u.isOnline && u.id !== 'user-1' && u.currentView === 'document'
  )

  const handleContentChange = useCallback(
    (value: string) => {
      setLocalContent(value)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(true)
        dispatch({ type: 'SET_DOCUMENT', payload: value })
        setTimeout(() => {
          setIsSaving(false)
          setLastSaved(new Date())
        }, 600)
      }, 800)
    },
    [dispatch]
  )

  const insertFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = localContent.slice(start, end)
    const newContent =
      localContent.slice(0, start) + prefix + selected + suffix + localContent.slice(end)
    setLocalContent(newContent)
    handleContentChange(newContent)
    setTimeout(() => {
      textarea.selectionStart = start + prefix.length
      textarea.selectionEnd = end + prefix.length
      textarea.focus()
    }, 0)
  }

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-slate-200 mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-slate-100 mt-6 mb-3 border-b border-workspace-border pb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-2 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-slate-300 italic">$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-workspace-hover text-primary-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^- \[x\] (.+)$/gm, '<li class="flex items-center gap-2 text-slate-400 line-through"><span class="text-emerald-400">✓</span> $1</li>')
      .replace(/^- \[ \] (.+)$/gm, '<li class="flex items-center gap-2 text-slate-300"><span class="text-slate-600">○</span> $1</li>')
      .replace(/^- (.+)$/gm, '<li class="text-slate-300 ml-4 list-disc">$1</li>')
      .replace(/^\*\*\*$/gm, '<hr class="border-workspace-border my-4" />')
      .replace(/^---$/gm, '<hr class="border-workspace-border my-4" />')
      .replace(/\n/g, '<br />')
  }

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-workspace-card border-b border-workspace-border">
        <div className="flex items-center gap-1">
          <button
            onClick={() => insertFormat('**', '**')}
            className="p-1.5 rounded hover:bg-workspace-hover text-slate-400 hover:text-slate-200 transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormat('*', '*')}
            className="p-1.5 rounded hover:bg-workspace-hover text-slate-400 hover:text-slate-200 transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormat('`', '`')}
            className="p-1.5 rounded hover:bg-workspace-hover text-slate-400 hover:text-slate-200 transition-colors"
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormat('## ')}
            className="p-1.5 rounded hover:bg-workspace-hover text-slate-400 hover:text-slate-200 transition-colors"
            title="Heading"
          >
            <Hash className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormat('- ')}
            className="p-1.5 rounded hover:bg-workspace-hover text-slate-400 hover:text-slate-200 transition-colors"
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-workspace-border mx-1" />
          {editingUsers.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span>{editingUsers.length} editing</span>
              <div className="flex -space-x-1">
                {editingUsers.map(u => (
                  <div
                    key={u.id}
                    className={`w-5 h-5 rounded-full ${colorMap[u.color]} flex items-center justify-center text-xs font-bold text-white border border-workspace-card`}
                    title={u.name}
                  >
                    {u.avatar[0]}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-slate-500 animate-pulse">Saving...</span>
          )}
          {!isSaving && lastSaved && (
            <span className="text-xs text-slate-500">
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPreview
                ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                : 'bg-workspace-hover text-slate-400 hover:text-slate-200'
            }`}
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {isPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-auto">
        {isPreview ? (
          <div
            className="max-w-3xl mx-auto px-8 py-6 prose prose-invert"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={e => handleContentChange(e.target.value)}
            className="w-full h-full bg-transparent text-slate-300 text-sm font-mono leading-relaxed p-8 resize-none outline-none placeholder-slate-600"
            placeholder="Start typing your document..."
            spellCheck={false}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-workspace-card border-t border-workspace-border text-xs text-slate-500">
        <span>{localContent.split('\n').length} lines · {localContent.length} chars</span>
        <span>Markdown supported</span>
      </div>
    </div>
  )
}
