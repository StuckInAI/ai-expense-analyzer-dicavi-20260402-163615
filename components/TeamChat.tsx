'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Smile, Paperclip, Hash } from 'lucide-react'
import { useWorkspace, Message } from '@/context/WorkspaceContext'
import { v4 as uuidv4 } from 'uuid'
import { formatDistanceToNow } from 'date-fns'

const EMOJIS = ['👍', '❤️', '🎉', '🚀', '👀', '✅', '🔥', '💡']

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-emerald-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  yellow: 'bg-yellow-500',
}

const TEXT_COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  green: 'text-emerald-400',
  orange: 'text-orange-400',
  pink: 'text-pink-400',
  yellow: 'text-yellow-400',
}

export default function TeamChat() {
  const { state, dispatch, addNotification } = useWorkspace()
  const [input, setInput] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const typingUsers = state.users.filter(
    u => u.isTyping && u.id !== 'user-1' && u.isOnline
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  const getUserById = (id: string) => state.users.find(u => u.id === id)

  const handleSend = () => {
    if (!input.trim()) return
    const message: Message = {
      id: uuidv4(),
      userId: 'user-1',
      content: input.trim(),
      timestamp: new Date(),
      reactions: {},
    }
    dispatch({ type: 'ADD_MESSAGE', payload: message })
    setInput('')
    inputRef.current?.focus()
  }

  const handleReaction = (messageId: string, emoji: string) => {
    dispatch({
      type: 'ADD_REACTION',
      payload: { messageId, emoji, userId: 'user-1' },
    })
  }

  const groupedMessages = state.messages.reduce<{ date: string; messages: Message[] }[]>(
    (groups, msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString()
      const lastGroup = groups[groups.length - 1]
      if (lastGroup && lastGroup.date === date) {
        lastGroup.messages.push(msg)
      } else {
        groups.push({ date, messages: [msg] })
      }
      return groups
    },
    []
  )

  return (
    <div className="flex flex-col h-full">
      {/* Channel header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-workspace-border bg-workspace-card">
        <Hash className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-200">general</span>
        <div className="w-px h-4 bg-workspace-border mx-1" />
        <span className="text-xs text-slate-500">{state.messages.length} messages</span>
        <div className="ml-auto flex items-center gap-1.5">
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="typing-indicator flex items-center">
                <span className="bg-slate-400" />
                <span className="bg-slate-400" />
                <span className="bg-slate-400" />
              </div>
              <span>{typingUsers.map(u => u.name).join(', ')} typing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map(group => (
          <div key={group.date}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-workspace-border" />
              <span className="text-xs text-slate-600 px-2">{group.date}</span>
              <div className="flex-1 h-px bg-workspace-border" />
            </div>
            <div className="space-y-3">
              {group.messages.map(msg => {
                const user = getUserById(msg.userId)
                const isOwn = msg.userId === 'user-1'
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 group animate-fade-in ${
                      isOwn ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${
                        user ? COLOR_MAP[user.color] : 'bg-slate-600'
                      }`}
                    >
                      {user?.avatar || '?'}
                    </div>
                    <div className={`flex flex-col max-w-xs lg:max-w-md ${
                      isOwn ? 'items-end' : 'items-start'
                    }`}>
                      <div className={`flex items-baseline gap-2 mb-1 ${
                        isOwn ? 'flex-row-reverse' : ''
                      }`}>
                        <span className={`text-xs font-semibold ${
                          user ? TEXT_COLOR_MAP[user.color] : 'text-slate-400'
                        }`}>
                          {isOwn ? 'You' : user?.name}
                        </span>
                        <span className="text-xs text-slate-600">
                          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          isOwn
                            ? 'bg-primary-600 text-white rounded-tr-sm'
                            : 'bg-workspace-card border border-workspace-border text-slate-200 rounded-tl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {/* Reactions */}
                      {Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(msg.reactions).map(([emoji, users]) =>
                            users.length > 0 ? (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                                  users.includes('user-1')
                                    ? 'bg-primary-600/20 border-primary-600/40 text-primary-300'
                                    : 'bg-workspace-hover border-workspace-border text-slate-400 hover:border-slate-500'
                                }`}
                              >
                                {emoji} {users.length}
                              </button>
                            ) : null
                          )}
                        </div>
                      )}
                      {/* Quick reactions */}
                      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {EMOJIS.slice(0, 4).map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="text-sm hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-workspace-border bg-workspace-card">
        <div className="flex items-center gap-2 bg-workspace-hover rounded-xl px-4 py-2.5 border border-workspace-border focus-within:border-primary-500/50 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Message #general..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
          />
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                className="p-1.5 rounded-lg hover:bg-workspace-card text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showEmojis && (
                <div className="absolute bottom-10 right-0 bg-workspace-card border border-workspace-border rounded-xl p-2 flex gap-1 shadow-xl">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setInput(prev => prev + emoji)
                        setShowEmojis(false)
                        inputRef.current?.focus()
                      }}
                      className="text-lg hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="p-1.5 rounded-lg hover:bg-workspace-card text-slate-500 hover:text-slate-300 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
