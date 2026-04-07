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

  // ✅ FIX: use UID
  const {
    tasks,
    tasksLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete
  } = useTasks(currentUser?.uid)

  const { dark, toggle: toggleDark } = useDarkMode()
  const { toasts, toast, remove } = useToast()

  const [authView, setAuthView] = useState('login')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)

  useNotifications(tasks, !!currentUser)

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  // Auth
  if (!currentUser) {
    return authView === 'login' ? (
      <LoginPage onLogin={login} onGoSignup={() => setAuthView('signup')} />
    ) : (
      <SignupPage onSignup={signup} onGoLogin={() => setAuthView('login')} />
    )
  }

  // Handlers
  const handleSubmit = async (form) => {
    try {
      if (editTask) {
        await updateTask(editTask.id, form)
        toast('Task updated', 'info')
      } else {
        await addTask(form)
        toast('Task added 🎉', 'success')
      }
    } catch (err) {
      console.error(err)
      toast('Error occurred', 'error')
    }

    setEditTask(null)
    setModalOpen(false)
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

      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white">📚</div>
            <span className="font-bold hidden sm:block">Study Planner</span>
          </div>

          <div className="flex items-center gap-2">

            {/* Dark mode */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleDark}
              className="p-2 rounded bg-gray-200 dark:bg-gray-700"
            >
              {dark ? '☀️' : '🌙'}
            </motion.button>

            {/* Add task */}
            <button
              onClick={handleAddTask}
              className="hidden sm:block bg-indigo-600 text-white px-3 py-1 rounded"
            >
              + Task
            </button>

            {/* User */}
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 bg-indigo-200 rounded flex items-center justify-center text-sm font-bold">
                {currentUser.displayName?.[0] || currentUser.email?.[0]}
              </div>

              <span className="hidden md:block text-sm">
                {currentUser.displayName || currentUser.email}
              </span>

              <button
                onClick={logout}
                className="text-xs text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto p-4">
        {tasksLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* ✅ FIX HERE TOO */}
            <CalendarConnect userId={currentUser.uid} />

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