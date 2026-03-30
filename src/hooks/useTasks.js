import { useState, useEffect } from 'react'

const storageKey = (userId) => `study-planner-tasks-${userId}`

export function useTasks(userId) {
  const [tasks, setTasks] = useState(() => {
    if (!userId) return []
    try {
      const stored = localStorage.getItem(storageKey(userId))
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // reload tasks when user changes
  useEffect(() => {
    if (!userId) { setTasks([]); return }
    try {
      const stored = localStorage.getItem(storageKey(userId))
      setTasks(stored ? JSON.parse(stored) : [])
    } catch {
      setTasks([])
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    localStorage.setItem(storageKey(userId), JSON.stringify(tasks))
  }, [tasks, userId])

  const addTask = (task) =>
    setTasks((prev) => [
      ...prev,
      { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ])

  const updateTask = (id, updates) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id))

  const toggleComplete = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )

  return { tasks, addTask, updateTask, deleteTask, toggleComplete }
}
