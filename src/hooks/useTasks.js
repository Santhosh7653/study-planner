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
      // userId is null while auth is resolving — not an error, just wait
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

  const addTask = async (task) => {
    if (!userId) return console.error('[useTasks] addTask called without userId')
    try {
      await addDoc(collection(db, 'users', userId, 'tasks'), {
        ...task,
        completed: false,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('[useTasks] addTask error:', err)
      throw err // re-throw so App.jsx can catch and show toast
    }
  }

  const updateTask = async (id, updates) => {
    if (!userId) return
    try {
      // Clear 1h notification flag if deadline changed
      const existing = tasks.find((t) => t.id === id)
      if (updates.deadline && existing?.deadline !== updates.deadline) {
        localStorage.removeItem(`study-notif-1h-${id}`)
      }
      await updateDoc(doc(db, 'users', userId, 'tasks', id), updates)
    } catch (err) {
      console.error('[useTasks] updateTask error:', err)
      throw err
    }
  }

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
