import { useState } from 'react'
import { isToday, isPast } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from './TaskCard'

const navItems = [
  { id: 'today', label: 'Today', icon: '📅' },
  { id: 'upcoming', label: 'Upcoming', icon: '🗓️' },
  { id: 'all', label: 'All Tasks', icon: '📋' },
  { id: 'completed', label: 'Completed', icon: '✅' },
]

export default function Dashboard({ tasks, onEdit, onDelete, onToggle, onAddTask }) {
  const [activeNav, setActiveNav] = useState('today')
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const overdue = tasks.filter((t) => !t.completed && isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)))
  const todayTasks = tasks.filter((t) => isToday(new Date(t.deadline)))
  const upcoming = tasks.filter((t) => !t.completed && !isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)))
  const completed = tasks.filter((t) => t.completed)
  const total = tasks.length
  const completedCount = completed.length
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0

  const counts = {
    today: todayTasks.length + overdue.length,
    upcoming: upcoming.length,
    all: tasks.filter((t) => !t.completed).length,
    completed: completedCount,
  }

  const getFilteredTasks = () => {
    let base = []
    if (activeNav === 'today') base = [...overdue, ...todayTasks]
    else if (activeNav === 'upcoming') base = upcoming
    else if (activeNav === 'all') base = tasks.filter((t) => !t.completed)
    else base = completed

    return base
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => filterPriority === 'all' || t.priority === filterPriority)
  }

  const filtered = getFilteredTasks()

  return (
    <div className="flex h-full gap-0">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-40 lg:z-auto flex flex-col p-4 gap-1 shrink-0 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ minHeight: 0 }}
      >
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Views</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveNav(item.id); setSidebarOpen(false) }}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeNav === item.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span>{item.icon}</span>
              {item.label}
            </span>
            {counts[item.id] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeNav === item.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {counts[item.id]}
              </span>
            )}
          </button>
        ))}

        {/* Progress card */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
            <div className="flex justify-between text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
              {completedCount} of {total} tasks done
            </p>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 relative min-w-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="all">All</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Task</span>
          </motion.button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: total, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'Today', value: todayTasks.length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Overdue', value: overdue.length, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'Done', value: completedCount, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-gray-400 dark:text-gray-600"
              >
                <div className="text-5xl mb-3">🚀</div>
                <p className="text-sm font-medium">No tasks here yet</p>
                <p className="text-xs mt-1">Add one to get started!</p>
              </motion.div>
            ) : (
              filtered.map((t) => (
                <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
