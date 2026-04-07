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

export function useTasks(userId) {
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      console.warn("❌ No userId provided to useTasks")
      setTasks([])
      return
    }

    console.log("✅ Fetching tasks for UID:", userId)

    setTasksLoading(true)

    const q = query(
      collection(db, 'users', userId, 'tasks'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        setTasks(fetched)
        setTasksLoading(false)
      },
      (error) => {
        console.error("🔥 Firestore Error:", error)
        setTasksLoading(false)
      }
    )

    return unsubscribe
  }, [userId])

  const addTask = async (task) => {
    if (!userId) {
      console.error("❌ Cannot add task: userId missing")
      return
    }

    try {
      await addDoc(collection(db, 'users', userId, 'tasks'), {
        ...task,
        completed: false,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error("🔥 Add Task Error:", err)
    }
  }

  const updateTask = async (id, updates) => {
    if (!userId) return

    try {
      const existing = tasks.find((t) => t.id === id)

      if (updates.deadline && existing?.deadline !== updates.deadline) {
        localStorage.removeItem(`study-notif-1h-${id}`)
      }

      await updateDoc(doc(db, 'users', userId, 'tasks', id), updates)
    } catch (err) {
      console.error("🔥 Update Task Error:", err)
    }
  }

  const deleteTask = async (id) => {
    if (!userId) return

    try {
      localStorage.removeItem(`study-notif-1h-${id}`)
      localStorage.removeItem(`study-notif-daily-${id}`)

      await deleteDoc(doc(db, 'users', userId, 'tasks', id))
    } catch (err) {
      console.error("🔥 Delete Task Error:", err)
    }
  }

  const toggleComplete = async (id) => {
    if (!userId) return

    try {
      const task = tasks.find((t) => t.id === id)
      if (!task) return

      await updateDoc(doc(db, 'users', userId, 'tasks', id), {
        completed: !task.completed,
      })
    } catch (err) {
      console.error("🔥 Toggle Error:", err)
    }
  }

  return {
    tasks,
    tasksLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
  }
}