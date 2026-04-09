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

function ToastContainer({ toasts, onRemove }) {
  const colors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-indigo-500' }
  const icons  = { success: '✅', error: '❌', info: 'ℹ️' }
  return (
    <div className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-xs w-full">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl text-white text-sm font-medium shadow-xl ${colors[t.type] || colors.info}`}
          >
            <span className="text-base">{icons[t.type] || icons.info}</span>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => onRemove(t.id)} className="opacity-60 hover:opacity-100 transition-opacity text-lg leading-none">×</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  const { currentUser, authLoading, login, signup, googleLogin, logout } = useAuth()
  const userId    = currentUser?.id    || null
  const userEmail = currentUser?.email || null
  const userName  = currentUser?.username || null
  const { tasks, tasksLoading, addTask, updateTask, deleteTask, toggleComplete } = useTasks(userId, userEmail, userName)
  const { dark, toggle: toggleDark } = useDarkMode()
  const { toasts, toast, remove } = useToast()
  const [authView, setAuthView] = useState('login')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)

  useNotifications(tasks, !!currentUser)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading your planner...</span>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return authView === 'login' ? (
      <LoginPage onLogin={login} onGoogleLogin={googleLogin} onGoSignup={() => setAuthView('signup')} />
    ) : (
      <SignupPage onSignup={signup} onGoLogin={() => setAuthView('login')} />
    )
  }

  const getAccessToken = () => localStorage.getItem('googleAccessToken')

  const handleSubmit = async (form) => {
    try {
      const accessToken = getAccessToken()
      let eventId = editTask?.eventId || null
      if (!editTask) {
        if (accessToken) {
          const calEvent = await createCalendarEvent(form, accessToken)
          eventId = calEvent?.id || null
        }
        await addTask({ ...form, eventId })
        toast('Task added 🎉', 'success')
      } else {
        if (editTask.eventId && accessToken) await updateCalendarEvent(editTask.eventId, form, accessToken)
        await updateTask(editTask.id, { ...form, eventId: editTask.eventId || null })
        toast('Task updated', 'info')
      }
    } catch (err) {
      console.error('[App] Calendar sync error:', err)
      toast('Saved — Calendar sync failed ⚠️', 'error')
    }
    setEditTask(null)
    setModalOpen(false)
  }

  const handleEdit = (task) => { setEditTask(task); setModalOpen(true) }

  const handleDelete = async (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    try {
      const accessToken = getAccessToken()
      if (task.eventId && accessToken) await deleteCalendarEvent(task.eventId, accessToken)
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

  const handleAddTask = () => { setEditTask(null); setModalOpen(true) }

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

      {/* ── Header ── */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm shadow-md shadow-indigo-200 dark:shadow-none">
              📚
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white hidden sm:block tracking-tight">
              Study Planner
            </span>
          </div>

          {/* Right side — dark mode + user only; "New Task" removed (Add Task lives in Dashboard toolbar) */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={toggleDark}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? '☀️' : '🌙'}
            </motion.button>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700 ml-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold uppercase text-white shadow-sm">
                {currentUser?.username?.[0] || 'U'}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 hidden md:block max-w-[100px] truncate">
                {currentUser?.username}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {tasksLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-sm">Loading tasks...</span>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
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

      {/* ── Mobile FAB ── */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleAddTask}
        className="fixed bottom-6 right-4 sm:hidden z-30 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl shadow-indigo-300 dark:shadow-indigo-900 flex items-center justify-center text-2xl"
        aria-label="Add task"
      >
        +
      </motion.button>
    </div>
  )
}
