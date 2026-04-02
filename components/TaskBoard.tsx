'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Flag, Tag, Trash2, X, Check } from 'lucide-react'
import { useWorkspace, Task } from '@/context/WorkspaceContext'
import { v4 as uuidv4 } from 'uuid'

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'text-slate-400', dot: 'bg-slate-400' },
  { id: 'in-progress', label: 'In Progress', color: 'text-blue-400', dot: 'bg-blue-400' },
  { id: 'review', label: 'Review', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  { id: 'done', label: 'Done', color: 'text-emerald-400', dot: 'bg-emerald-400' },
] as const

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-400/10' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-400/10' },
}

const USER_COLORS: Record<string, string> = {
  'user-1': 'bg-blue-500',
  'user-2': 'bg-purple-500',
  'user-3': 'bg-emerald-500',
  'user-4': 'bg-orange-500',
  'user-5': 'bg-pink-500',
}

export default function TaskBoard() {
  const { state, dispatch, addNotification } = useWorkspace()
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const getTasksByStatus = (status: string) =>
    state.tasks.filter(t => t.status === status)

  const handleAddTask = (status: string) => {
    if (!newTaskTitle.trim()) return
    const task: Task = {
      id: uuidv4(),
      title: newTaskTitle.trim(),
      description: '',
      status: status as Task['status'],
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    }
    dispatch({ type: 'ADD_TASK', payload: task })
    addNotification('task_updated', `New task added: "${task.title}"`)
    setNewTaskTitle('')
    setAddingTo(null)
  }

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, status: newStatus } })
    addNotification('task_updated', `Task moved to ${newStatus.replace('-', ' ')}`)
  }

  const handleDragStart = (taskId: string) => setDragging(taskId)
  const handleDragEnd = () => { setDragging(null); setDragOver(null) }
  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    setDragOver(colId)
  }
  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    if (dragging) handleStatusChange(dragging, colId as Task['status'])
    setDragging(null)
    setDragOver(null)
  }

  return (
    <div className="flex gap-4 p-4 h-full overflow-x-auto">
      {COLUMNS.map(col => {
        const tasks = getTasksByStatus(col.id)
        return (
          <div
            key={col.id}
            className={`flex flex-col w-72 flex-shrink-0 rounded-xl border transition-colors ${
              dragOver === col.id
                ? 'border-primary-500/50 bg-primary-500/5'
                : 'border-workspace-border bg-workspace-card/50'
            }`}
            onDragOver={e => handleDragOver(e, col.id)}
            onDrop={e => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-workspace-border">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                <span className="text-xs text-slate-600 bg-workspace-hover px-1.5 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              </div>
              <button
                onClick={() => setAddingTo(col.id)}
                className="p-1 rounded hover:bg-workspace-hover text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Tasks */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isDragging={dragging === task.id}
                  onDragStart={() => handleDragStart(task.id)}
                  onDragEnd={handleDragEnd}
                  onDelete={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}
                  onStatusChange={handleStatusChange}
                />
              ))}

              {/* Add Task Input */}
              {addingTo === col.id && (
                <div className="bg-workspace-card border border-workspace-border rounded-lg p-3 animate-slide-up">
                  <input
                    autoFocus
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddTask(col.id)
                      if (e.key === 'Escape') setAddingTo(null)
                    }}
                    placeholder="Task title..."
                    className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAddTask(col.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-primary-600 rounded text-xs text-white hover:bg-primary-700"
                    >
                      <Check className="w-3 h-3" /> Add
                    </button>
                    <button
                      onClick={() => setAddingTo(null)}
                      className="flex items-center gap-1 px-2 py-1 bg-workspace-hover rounded text-xs text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add button */}
            {addingTo !== col.id && (
              <button
                onClick={() => setAddingTo(col.id)}
                className="flex items-center gap-2 mx-2 mb-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-workspace-hover transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add task
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
  onStatusChange,
}: {
  task: Task
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDelete: () => void
  onStatusChange: (id: string, status: Task['status']) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const priority = PRIORITY_CONFIG[task.priority]
  const assigneeColor = task.assignee ? USER_COLORS[task.assignee] || 'bg-slate-500' : null
  const assigneeInitials = task.assignee === 'user-1' ? 'YO' :
    task.assignee === 'user-2' ? 'AC' :
    task.assignee === 'user-3' ? 'SR' :
    task.assignee === 'user-4' ? 'JL' : 'TK'

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-workspace-card border border-workspace-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all group ${
        isDragging ? 'opacity-40 scale-95' : 'hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-200 font-medium leading-snug flex-1">{task.title}</p>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-workspace-hover text-slate-500 hover:text-slate-300 transition-all"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 bg-workspace-card border border-workspace-border rounded-lg shadow-xl z-10 py-1 w-36">
              {(['todo', 'in-progress', 'review', 'done'] as Task['status'][]).map(s => (
                <button
                  key={s}
                  onClick={() => { onStatusChange(task.id, s); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-workspace-hover"
                >
                  Move to {s.replace('-', ' ')}
                </button>
              ))}
              <div className="border-t border-workspace-border my-1" />
              <button
                onClick={() => { onDelete(); setShowMenu(false) }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-workspace-hover flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${priority.bg} ${priority.color}`}>
            <Flag className="w-3 h-3" />
            {priority.label}
          </span>
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-workspace-hover text-slate-500">
              {tag}
            </span>
          ))}
        </div>
        {assigneeColor && (
          <div className={`w-6 h-6 rounded-full ${assigneeColor} flex items-center justify-center text-xs font-bold text-white`}>
            {assigneeInitials}
          </div>
        )}
      </div>
    </div>
  )
}
