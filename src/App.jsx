import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useNotifications } from './hooks/useNotifications'
import TaskForm from './components/TaskForm'
import TaskCard from './components/TaskCard'
import Dashboard from './components/Dashboard'
import ReminderPopup from './components/ReminderPopup'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'

export default function App() {
  const { currentUser, login, signup, logout } = useAuth()
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks(currentUser?.id)
  const [authView, setAuthView] = useState('login') // 'login' | 'signup'
  const [editTask, setEditTask] = useState(null)
  const [view, setView] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')

  // Browser notifications — only when logged in
  useNotifications(tasks, !!currentUser)

  // Auth gates
  if (!currentUser) {
    return authView === 'login' ? (
      <LoginPage onLogin={login} onGoSignup={() => setAuthView('signup')} />
    ) : (
      <SignupPage onSignup={signup} onGoLogin={() => setAuthView('login')} />
    )
  }

  const handleSubmit = (form) => {
    if (editTask) {
      updateTask(editTask.id, form)
      setEditTask(null)
    } else {
      addTask(form)
    }
  }

  const handleEdit = (task) => {
    setEditTask(task)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => filterPriority === 'all' || t.priority === filterPriority)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.priority] - order[b.priority] || new Date(a.deadline) - new Date(b.deadline)
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <ReminderPopup tasks={tasks} />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">📚</span>
            <span className="text-lg font-bold text-gray-800">Study Planner</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {['dashboard', 'all'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  view === v
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {v === 'dashboard' ? '🏠 Dashboard' : '📋 All Tasks'}
              </button>
            ))}

            {/* User info + logout */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold uppercase">
                {currentUser.username[0]}
              </div>
              <span className="text-sm text-gray-700 font-medium hidden sm:block">
                {currentUser.username}
              </span>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        {/* Sidebar: Form */}
        <aside className="space-y-4">
          <TaskForm
            onSubmit={handleSubmit}
            editTask={editTask}
            onCancel={() => setEditTask(null)}
          />
        </aside>

        {/* Main content */}
        <section className="space-y-4">
          {view === 'all' && (
            <div className="flex gap-3 flex-wrap">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="flex-1 min-w-0 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="all">All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          )}

          {view === 'dashboard' ? (
            <Dashboard
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={deleteTask}
              onToggle={toggleComplete}
            />
          ) : (
            <div className="space-y-2">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-sm">No tasks found. Add one to get started!</p>
                </div>
              ) : (
                filteredTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onEdit={handleEdit}
                    onDelete={deleteTask}
                    onToggle={toggleComplete}
                  />
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
