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

export default function Dashboard({ tasks = [], onEdit, onDelete, onToggle, onAddTask }) {
  const [activeNav, setActiveNav] = useState('today')
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ✅ Safe date parser
  const safeDate = (d) => {
    try {
      return d ? new Date(d) : null
    } catch {
      return null
    }
  }

  // ✅ Categorizing tasks safely
  const overdue = tasks.filter((t) => {
    const date = safeDate(t.deadline)
    return date && !t.completed && isPast(date) && !isToday(date)
  })

  const todayTasks = tasks.filter((t) => {
    const date = safeDate(t.deadline)
    return date && isToday(date)
  })

  const upcoming = tasks.filter((t) => {
    const date = safeDate(t.deadline)
    return date && !t.completed && !isPast(date) && !isToday(date)
  })

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

  // ✅ Filtering logic
  const getFilteredTasks = () => {
    let base = []

    if (activeNav === 'today') base = [...overdue, ...todayTasks]
    else if (activeNav === 'upcoming') base = upcoming
    else if (activeNav === 'all') base = tasks.filter((t) => !t.completed)
    else base = completed

    return base
      .filter((t) =>
        t.title?.toLowerCase().includes(search.toLowerCase())
      )
      .filter(
        (t) => filterPriority === 'all' || t.priority === filterPriority
      )
  }

  const filtered = getFilteredTasks()

  return (
    <div className="flex h-full gap-0">
      
      {/* Overlay */}
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
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-40 flex flex-col p-4 gap-1 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2">
          Views
        </p>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveNav(item.id)
              setSidebarOpen(false)
            }}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm ${
              activeNav === item.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              {item.icon} {item.label}
            </span>
            {counts[item.id] > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                {counts[item.id]}
              </span>
            )}
          </button>
        ))}

        {/* Progress */}
        <div className="mt-auto pt-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-full bg-indigo-600 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col gap-4 p-4">
        
        {/* Toolbar */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 border rounded"
          >
            ☰
          </button>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="flex-1 border px-3 py-2 rounded"
          />

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={onAddTask}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            + Add
          </button>
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No tasks found
              </div>
            ) : (
              filtered.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}