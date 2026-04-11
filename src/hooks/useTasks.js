import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { apiUrl, safeFetch } from '../apiClient'

// ── Email notification helper ─────────────────────────────────────────────────
async function notifyByEmail({ type, task, userEmail, userName, previousTask }) {
  if (!userEmail) {
    console.warn('[useTasks] No userEmail found, skipping email')
    return
  }

  try {
    console.log('[useTasks] Sending email:', type, task)

    const res = await safeFetch(apiUrl('/api/send-email'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        task,
        email: userEmail,   // 🔥 FIXED (important)
        userName,
        previousTask,
      }),
    })

    if (res) console.log('[useTasks] Email API response:', res.status)
  } catch (err) {
    console.warn('[useTasks] Email notification failed:', err.message)
  }
}

export function useTasks(userId, userEmail, userName) {
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setTasks([])
      setTasksLoading(false)
      return
    }

    setTasksLoading(true)

    const q = query(
      collection(db, 'users', userId, 'tasks'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
        setTasksLoading(false)
      },
      (err) => {
        console.error('[useTasks] Firestore error:', err)
        setTasksLoading(false)
      }
    )

    return unsubscribe
  }, [userId])

  // ── addTask ─────────────────────────────────────────────────────────────────
  const addTask = async (task) => {
    if (!userId) return console.error('[useTasks] addTask called without userId')

    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'tasks'), {
        ...task,
        completed: false,
        reminderSent: false,
        createdAt: serverTimestamp(),
      })

      // 🔥 Ensure email is actually triggered
      await notifyByEmail({
        type: 'task_created',
        task: { ...task, id: docRef.id },
        userEmail,
        userName,
      })

    } catch (err) {
      console.error('[useTasks] addTask error:', err)
      throw err
    }
  }

  // ── updateTask ──────────────────────────────────────────────────────────────
  const updateTask = async (id, updates) => {
    if (!userId) return

    try {
      const existing = tasks.find((t) => t.id === id)

      const deadlineChanged =
        updates.deadline && existing?.deadline !== updates.deadline

      const priorityChanged =
        updates.priority && existing?.priority !== updates.priority

      const titleChanged =
        updates.title && existing?.title !== updates.title

      const notesChanged =
        updates.notes !== undefined && existing?.notes !== updates.notes

      if (deadlineChanged) {
        localStorage.removeItem(`study-notif-1h-${id}`)
        updates.reminderSent = false
      }

      await updateDoc(doc(db, 'users', userId, 'tasks', id), updates)

      // Send appropriate notification email based on what changed
      if (deadlineChanged) {
        await notifyByEmail({
          type: 'deadline_updated',
          task: { ...existing, ...updates, id },
          userEmail,
          userName,
          previousTask: existing,
        })
      } else if (priorityChanged) {
        await notifyByEmail({
          type: 'priority_changed',
          task: { ...existing, ...updates, id },
          userEmail,
          userName,
          previousTask: existing,
        })
      } else if (titleChanged) {
        await notifyByEmail({
          type: 'title_updated',
          task: { ...existing, ...updates, id },
          userEmail,
          userName,
          previousTask: existing,
        })
      } else if (notesChanged) {
        await notifyByEmail({
          type: 'notes_updated',
          task: { ...existing, ...updates, id },
          userEmail,
          userName,
          previousTask: existing,
        })
      }

    } catch (err) {
      console.error('[useTasks] updateTask error:', err)
      throw err
    }
  }

  // ── deleteTask ──────────────────────────────────────────────────────────────
  const deleteTask = async (id) => {
    if (!userId) return
    try {
      localStorage.removeItem(`study-notif-1h-${id}`)
      localStorage.removeItem(`study-notif-daily-${id}`)
      await deleteDoc(doc(db, 'users', userId, 'tasks', id))
    } catch (err) {
      console.error('[useTasks] deleteTask error:', err)
      throw err
    }
  }

  // ── toggleComplete ──────────────────────────────────────────────────────────
  const toggleComplete = async (id) => {
    if (!userId) return
    try {
      const task = tasks.find((t) => t.id === id)
      if (!task) return
      await updateDoc(doc(db, 'users', userId, 'tasks', id), {
        completed: !task.completed,
      })
    } catch (err) {
      console.error('[useTasks] toggleComplete error:', err)
    }
  }

  return { tasks, tasksLoading, addTask, updateTask, deleteTask, toggleComplete }
}