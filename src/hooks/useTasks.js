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
    if (!userId) { setTasks([]); return }

    setTasksLoading(true)
    const q = query(
      collection(db, 'users', userId, 'tasks'),
      orderBy('createdAt', 'desc')
    )

    // Real-time listener — updates UI instantly across all devices
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setTasks(fetched)
      setTasksLoading(false)
    }, () => {
      setTasksLoading(false)
    })

    return unsubscribe
  }, [userId])

  const addTask = async (task) => {
    if (!userId) return
    await addDoc(collection(db, 'users', userId, 'tasks'), {
      ...task,
      completed: false,
      createdAt: serverTimestamp(),
    })
  }

  const updateTask = async (id, updates) => {
    if (!userId) return
    // Clear 1-hour notification flag when deadline changes
    const existing = tasks.find((t) => t.id === id)
    if (updates.deadline && existing?.deadline !== updates.deadline) {
      localStorage.removeItem(`study-notif-1h-${id}`)
    }
    await updateDoc(doc(db, 'users', userId, 'tasks', id), updates)
  }

  const deleteTask = async (id) => {
    if (!userId) return
    // Clean up notification flags for deleted task
    localStorage.removeItem(`study-notif-1h-${id}`)
    localStorage.removeItem(`study-notif-daily-${id}`)
    await deleteDoc(doc(db, 'users', userId, 'tasks', id))
  }

  const toggleComplete = async (id) => {
    if (!userId) return
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    await updateDoc(doc(db, 'users', userId, 'tasks', id), {
      completed: !task.completed,
    })
  }

  return { tasks, tasksLoading, addTask, updateTask, deleteTask, toggleComplete }
}
