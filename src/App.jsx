import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useDarkMode } from './hooks/useDarkMode'
import { useToast } from './hooks/useToast'
import { useNotifications } from './hooks/useNotifications'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import Dashboard from './components/Dashboard'
import CalendarConnect from './components/CalendarConnect'
import TaskModal from './components/TaskModal'
import ReminderPopup from './components/ReminderPopup'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from './calendarService'

// Inline toast container — avoids the naming conflict with Toast.jsx
function ToastContainer({ toasts, onRemove }) {
  const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-indigo-500' }
  const icons  = { success: '✅', error: '❌', info: 'ℹ️' }
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${colors[t.type] || colors.info}`}
          >
            <span>{icons[t.type] || icons.info}</span>
            <span>{t.message}</span>
            <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  const { currentUser, authLoading, login, signup, googleLogin, logout } = useAuth()

  // useAuth returns { id, username, email } — always use .id for Firestore paths
  const userId = currentUser?.id || null

  const { tasks, tasksLoading, addTask, updateTask, deleteTask, toggleComplete } = useTasks(userId)
  const { dark, toggle: toggleDark } = useDarkMode()
  const { toasts, toast, remove } = useToast()

  const [authView, setAuthView] = useState('login')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)

  useNotifications(tasks, !!currentUser)

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  // ── Auth screens ────────────────────────────────────────────────────────────
  if (!currentUser) {
    return authView === 'login' ? (
      <LoginPage
        onLogin={login}
        onGoogleLogin={googleLogin}
        onGoSignup={() => setAuthView('signup')}
      />
    ) : (
      <SignupPage onSignup={signup} onGoLogin={() => setAuthView('login')} />
    )
  }

  // ── Calendar helpers ────────────────────────────────────────────────────────
  const getAccessToken = () => localStorage.getItem('googleAccessToken')

  // ── Task handlers ───────────────────────────────────────────────────────────
  const handleSubmit = async (form) => {
    try {
      const accessToken = getAccessToken()
      let eventId = editTask?.eventId || null

      if (!editTask) {
        // Create new task — sync to Calendar if connected
        if (accessToken) {
          const calEvent = await createCalendarEvent(form, accessToken)
          eventId = calEvent?.id || null
        }
        await addTask({ ...form, eventId })
        toast('Task added 🎉', 'success')
      } else {
        // Update existing task — sync Calendar event if it exists
        if (editTask.eventId && accessToken) {
          await updateCalendarEvent(editTask.eventId, form, accessToken)
        }
        await updateTask(editTask.id, { ...form, eventId: editTask.eventId || null })
        toast('Task updated', 'info')
      }
    } catch (err) {
      console.error('[App] Calendar sync error:', err)
      toast('Saved locally — Calendar sync failed ⚠️', 'error')
    }

    setEditTask(null)
    setModalOpen(false)
  }

  const handleEdit = (task) => {
    setEditTask(task)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    try {
      const accessToken = getAccessToken()
      if (task.eventId && accessToken) {
        await deleteCalendarEvent(task.eventId, accessToken)
      }
      await deleteTask(id)
      toast('Task deleted', 'error')
    } catch (err) {
      console.error('[App] Delete sync error:', err)
      toast('Delete failed ⚠️', 'error')
    }
  }

  const handleToggle = async (id) => {
    const task = tasks.find((t) => t.id === id)
    await toggleComplete(id)
    toast(task?.completed ? 'Marked as pending' : 'Task completed ✅', 'success')
  }

  const handleAddTask = () => {
    setEditTask(null)
    setModalOpen(true)
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <ReminderPopup tasks={tasks} />
      <ToastContainer toasts={toasts} onRemove={remove} />

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null) }}
        onSubmit={handleSubmit}
        editTask={editTask}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-base">📚</div>
            <span className="text-base font-bold text-gray-900 dark:text-white hidden sm:block">Study Planner</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleDark}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? '☀️' : '🌙'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddTask}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              ➕ New Task
            </motion.button>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700 ml-1">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300">
                {currentUser?.username?.[0] || 'U'}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                {currentUser?.username}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {tasksLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            <CalendarConnect userId={userId} />
            <Dashboard
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onAddTask={handleAddTask}
            />
          </motion.div>
        )}
      </main>
    </div>
  )
}
