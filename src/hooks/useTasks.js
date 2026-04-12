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
import { sendEmailNotification } from '../apiClient'

// ── Email notification helper ─────────────────────────────────────────────────
async function notifyByEmail({ eventType, task, userEmail, userName, previousTask }) {
  if (!userEmail) {
    console.warn('[useTasks] No userEmail found, skipping email')
    return
  }

  try {
    console.log('[useTasks] Sending email:', eventType, task)

    const result = await sendEmailNotification(eventType, {
      to: userEmail,
      taskTitle: task?.title,
      priority: task?.priority,
      dueDate: task?.deadline || task?.dueDate,
      notes: task?.notes || '',
      userName,
      changes: {
        previousPriority: previousTask?.priority,
        previousDeadline: previousTask?.deadline || previousTask?.dueDate,
        previousTitle: previousTask?.title,
        previousNotes: previousTask?.notes,
      },
    })

    if (!result.success) {
      console.warn('[useTasks] Email skipped or failed:', result.reason || 'unknown')
    }

    return result
  } catch (err) {
    console.warn('[useTasks] Email error (non-blocking):', err.message)
    return { success: false, reason: err.message }
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

      const newTask = { ...task, id: docRef.id }
      console.log('[useTasks] Task created successfully', newTask)

      notifyByEmail({
        eventType: 'task_created',
        task: newTask,
        userEmail,
        userName,
      })
        .then((result) => {
          if (result?.success) {
            console.log('[useTasks] ✅ Email sent successfully')
          } else {
            console.warn('[useTasks] ⚠️ Email skipped or failed:', result?.reason)
          }
        })
        .catch((err) => {
          console.warn('[useTasks] ⚠️ Email error (non-blocking):', err.message)
        })

      return newTask
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

      const updatedTask = { ...existing, ...updates, id }
      let emailType = null

      if (deadlineChanged) {
        emailType = 'due_date_changed'
      } else if (priorityChanged) {
        emailType = 'priority_changed'
      } else if (titleChanged) {
        emailType = 'title_updated'
      } else if (notesChanged) {
        emailType = 'notes_updated'
      }

      if (emailType) {
        notifyByEmail({
          eventType: emailType,
          task: updatedTask,
          userEmail,
          userName,
          previousTask: existing,
        })
          .then((result) => {
            if (result?.success) {
              console.log('[useTasks] ✅ Update email sent successfully')
            } else {
              console.warn('[useTasks] ⚠️ Update email skipped or failed:', result?.reason)
            }
          })
          .catch((err) => {
            console.warn('[useTasks] ⚠️ Update email error (non-blocking):', err.message)
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