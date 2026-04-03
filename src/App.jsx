import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useNotifications } from './hooks/useNotifications'
import { useDarkMode } from './hooks/useDarkMode'
import { useToast } from './hooks/useToast'
import Dashboard from './components/Dashboard'
import TaskModal from './components/TaskModal'
import ReminderPopup from './components/ReminderPopup'
import ToastContainer from './components/Toast'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import CalendarConnect from './components/CalendarConnect'

export default function App() {
  const { currentUser, authLoading, login, signup, logout } = useAuth()
  const { tasks, tasksLoading, addTask, updateTask, deleteTask, toggleComplete } = useTasks(currentUser?.id)
  const { dark, toggle: toggleDark } = useDarkMode()
  const { toasts, toast, remove } = useToast()

  const [authView, setAuthView] = useState('login')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)

  useNotifications(tasks, !!currentUser)

  // ── Auth loading ────────────────────────────────────────────────
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

  // ── Auth gates ──────────────────────────────────────────────────
  if (!currentUser) {
    return authView === 'login' ? (
      <LoginPage onLogin={login} onGoSignup={() => setAuthView('signup')} />
    ) : (
      <SignupPage onSignup={signup} onGoLogin={() => setAuthView('login')} />
    )
  }

  // ── Task handlers ───────────────────────────────────────────────
  const handleSubmit = async (form) => {
    if (editTask) {
      await updateTask(editTask.id, form)
      toast('Task updated', 'info')
    } else {
      await addTask(form)
      toast('Task added 🎉', 'success')
    }
    setEditTask(null)
  }

  const handleEdit = (task) => {
    setEditTask(task)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    toast('Task deleted', 'error')
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

      {/* Top Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-base">📚</div>
            <span className="text-base font-bold text-gray-900 dark:text-white hidden sm:block">Study Planner</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleDark}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Toggle dark mode"
            >
              {dark ? '☀️' : '🌙'}
            </motion.button>

            {/* Add task button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddTask}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </motion.button>

            {/* User avatar + logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700 ml-1">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold uppercase">
                {currentUser.username[0]}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium hidden md:block">
                {currentUser.username}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {tasksLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
          >
            <CalendarConnect userId={currentUser.id} />
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
