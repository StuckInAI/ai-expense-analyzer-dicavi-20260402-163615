'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

export type UserColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'yellow'

export interface User {
  id: string
  name: string
  color: UserColor
  avatar: string
  isOnline: boolean
  lastSeen: Date
  cursor?: { x: number; y: number }
  isTyping?: boolean
  currentView?: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export interface Message {
  id: string
  userId: string
  content: string
  timestamp: Date
  reactions: Record<string, string[]>
  edited?: boolean
}

export interface Notification {
  id: string
  type: 'user_joined' | 'task_updated' | 'message' | 'document_edit'
  message: string
  userId?: string
  timestamp: Date
}

export interface WorkspaceState {
  currentUser: User
  users: User[]
  tasks: Task[]
  messages: Message[]
  documentContent: string
  notifications: Notification[]
  isConnected: boolean
}

type Action =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> & { id: string } }
  | { type: 'REMOVE_USER'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Partial<Task> & { id: string } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'ADD_REACTION'; payload: { messageId: string; emoji: string; userId: string } }
  | { type: 'SET_DOCUMENT'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_CURSOR'; payload: { userId: string; x: number; y: number } }

const COLORS: UserColor[] = ['blue', 'purple', 'green', 'orange', 'pink', 'yellow']
const DEMO_NAMES = ['Alex Chen', 'Sam Rivera', 'Jordan Lee', 'Taylor Kim', 'Morgan Davis']
const AVATARS = ['AC', 'SR', 'JL', 'TK', 'MD']

const initialTasks: Task[] = [
  {
    id: uuidv4(),
    title: 'Design new dashboard layout',
    description: 'Create wireframes and mockups for the updated dashboard UI',
    status: 'in-progress',
    priority: 'high',
    assignee: 'user-2',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['design', 'ui'],
  },
  {
    id: uuidv4(),
    title: 'Implement real-time sync',
    description: 'Set up WebSocket connections for live collaboration features',
    status: 'todo',
    priority: 'high',
    assignee: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['backend', 'websocket'],
  },
  {
    id: uuidv4(),
    title: 'Write API documentation',
    description: 'Document all REST endpoints and WebSocket events',
    status: 'review',
    priority: 'medium',
    assignee: 'user-3',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['docs'],
  },
  {
    id: uuidv4(),
    title: 'Fix authentication bug',
    description: 'Resolve token refresh issue on mobile devices',
    status: 'done',
    priority: 'high',
    assignee: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['bug', 'auth'],
  },
  {
    id: uuidv4(),
    title: 'Performance optimization',
    description: 'Reduce bundle size and improve load times',
    status: 'todo',
    priority: 'medium',
    assignee: 'user-4',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['performance'],
  },
]

const initialMessages: Message[] = [
  {
    id: uuidv4(),
    userId: 'user-2',
    content: 'Hey team! Just pushed the latest design updates to the shared doc 🎨',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    reactions: { '👍': ['user-1', 'user-3'], '🎨': ['user-4'] },
  },
  {
    id: uuidv4(),
    userId: 'user-3',
    content: 'Looks great! I left some comments on the typography section',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    reactions: { '👀': ['user-2'] },
  },
  {
    id: uuidv4(),
    userId: 'user-1',
    content: 'The real-time sync is almost ready. Testing it now with the new cursor tracking feature',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    reactions: { '🚀': ['user-2', 'user-3', 'user-4'] },
  },
  {
    id: uuidv4(),
    userId: 'user-4',
    content: 'Amazing work everyone! Should we do a quick standup at 3pm?',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    reactions: { '✅': ['user-1', 'user-2', 'user-3'] },
  },
]

const initialDocument = `# Project Overview: Shared WorkSpace Platform

## Vision
Build a next-generation collaborative workspace that enables teams to work together seamlessly in real-time, regardless of location.

## Core Features

### 1. Live Document Editing
- Real-time collaborative text editing with conflict resolution
- Rich text formatting with markdown support
- Version history and change tracking
- Inline comments and suggestions

### 2. Task Management
- Kanban-style board with drag-and-drop
- Priority levels and due dates
- Team member assignments
- Progress tracking and analytics

### 3. Team Communication
- Persistent team chat with threading
- Emoji reactions and file sharing
- @mentions and notifications
- Video/audio call integration

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **State**: React Context + useReducer
- **Real-time**: Socket.io client

### Backend
- **Runtime**: Node.js with Socket.io server
- **Database**: PostgreSQL with Redis for caching
- **Auth**: JWT with refresh token rotation
- **Storage**: S3-compatible object storage

## Roadmap

### Q1 2024
- [x] Core workspace infrastructure
- [x] Real-time cursor tracking
- [ ] Video conferencing integration
- [ ] Mobile app (React Native)

### Q2 2024
- [ ] AI writing assistant
- [ ] Advanced analytics dashboard
- [ ] Third-party integrations (Slack, GitHub)
- [ ] Enterprise SSO support

## Team Notes

This document is being edited collaboratively. Feel free to add your thoughts and ideas below!

---
*Last updated by the team in real-time* ✨
`

function workspaceReducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, users: action.payload }
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] }
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.payload.id ? { ...u, ...action.payload } : u
        ),
      }
    case 'REMOVE_USER':
      return { ...state, users: state.users.filter(u => u.id !== action.payload) }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload, updatedAt: new Date() } : t
        ),
      }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'ADD_REACTION':
      return {
        ...state,
        messages: state.messages.map(m => {
          if (m.id !== action.payload.messageId) return m
          const reactions = { ...m.reactions }
          if (!reactions[action.payload.emoji]) reactions[action.payload.emoji] = []
          const users = reactions[action.payload.emoji]
          if (users.includes(action.payload.userId)) {
            reactions[action.payload.emoji] = users.filter(u => u !== action.payload.userId)
          } else {
            reactions[action.payload.emoji] = [...users, action.payload.userId]
          }
          return { ...m, reactions }
        }),
      }
    case 'SET_DOCUMENT':
      return { ...state, documentContent: action.payload }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 5),
      }
    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      }
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'UPDATE_CURSOR':
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.payload.userId
            ? { ...u, cursor: { x: action.payload.x, y: action.payload.y } }
            : u
        ),
      }
    default:
      return state
  }
}

const WorkspaceContext = createContext<{
  state: WorkspaceState
  dispatch: React.Dispatch<Action>
  addNotification: (type: Notification['type'], message: string, userId?: string) => void
} | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const currentUser: User = {
    id: 'user-1',
    name: 'You',
    color: 'blue',
    avatar: 'YO',
    isOnline: true,
    lastSeen: new Date(),
    currentView: 'document',
  }

  const initialUsers: User[] = [
    currentUser,
    {
      id: 'user-2',
      name: 'Alex Chen',
      color: 'purple',
      avatar: 'AC',
      isOnline: true,
      lastSeen: new Date(),
      cursor: { x: 300, y: 200 },
      currentView: 'document',
    },
    {
      id: 'user-3',
      name: 'Sam Rivera',
      color: 'green',
      avatar: 'SR',
      isOnline: true,
      lastSeen: new Date(),
      cursor: { x: 500, y: 350 },
      currentView: 'tasks',
    },
    {
      id: 'user-4',
      name: 'Jordan Lee',
      color: 'orange',
      avatar: 'JL',
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 5),
      currentView: 'chat',
    },
    {
      id: 'user-5',
      name: 'Taylor Kim',
      color: 'pink',
      avatar: 'TK',
      isOnline: true,
      lastSeen: new Date(),
      cursor: { x: 700, y: 150 },
      currentView: 'document',
    },
  ]

  const [state, dispatch] = useReducer(workspaceReducer, {
    currentUser,
    users: initialUsers,
    tasks: initialTasks,
    messages: initialMessages,
    documentContent: initialDocument,
    notifications: [],
    isConnected: true,
  })

  const addNotification = useCallback(
    (type: Notification['type'], message: string, userId?: string) => {
      const notification: Notification = {
        id: uuidv4(),
        type,
        message,
        userId,
        timestamp: new Date(),
      }
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
      setTimeout(() => {
        dispatch({ type: 'DISMISS_NOTIFICATION', payload: notification.id })
      }, 4000)
    },
    []
  )

  // Simulate live cursor movements
  useEffect(() => {
    const interval = setInterval(() => {
      const onlineUsers = state.users.filter(u => u.isOnline && u.id !== 'user-1' && u.cursor)
      onlineUsers.forEach(user => {
        if (user.cursor) {
          dispatch({
            type: 'UPDATE_CURSOR',
            payload: {
              userId: user.id,
              x: Math.max(100, Math.min(900, user.cursor.x + (Math.random() - 0.5) * 60)),
              y: Math.max(100, Math.min(600, user.cursor.y + (Math.random() - 0.5) * 40)),
            },
          })
        }
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [state.users])

  // Simulate live typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const userId = `user-${Math.floor(Math.random() * 4) + 2}`
      dispatch({ type: 'UPDATE_USER', payload: { id: userId, isTyping: true } })
      setTimeout(() => {
        dispatch({ type: 'UPDATE_USER', payload: { id: userId, isTyping: false } })
      }, 2000)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Simulate incoming messages
  useEffect(() => {
    const messages = [
      { userId: 'user-2', content: 'Just updated the design section! Take a look 👀' },
      { userId: 'user-3', content: 'Moving the API task to in-progress' },
      { userId: 'user-5', content: 'Great progress team! Almost done with my part' },
      { userId: 'user-2', content: 'Can someone review PR #42?' },
    ]
    let idx = 0
    const interval = setInterval(() => {
      if (idx < messages.length) {
        const msg = messages[idx]
        const newMessage: Message = {
          id: uuidv4(),
          userId: msg.userId,
          content: msg.content,
          timestamp: new Date(),
          reactions: {},
        }
        dispatch({ type: 'ADD_MESSAGE', payload: newMessage })
        const user = initialUsers.find(u => u.id === msg.userId)
        addNotification('message', `${user?.name}: ${msg.content.slice(0, 40)}...`, msg.userId)
        idx++
      }
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  return (
    <WorkspaceContext.Provider value={{ state, dispatch, addNotification }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
