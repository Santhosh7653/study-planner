import { useState } from 'react'
import { isToday, isPast } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from './TaskCard'

const navItems = [
  { id: 'today',     label: 'Today',     icon: '📅' },
  { id: 'upcoming',  label: 'Upcoming',  icon: '🗓️' },
  { id: 'all',       label: 'All Tasks', icon: '📋' },
  { id: 'completed', label: 'Completed', icon: '✅' },
]

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export default function Dashboard({ tasks, onEdit, onDelete, onToggle, onAddTask }) {
  const [activeNav, setActiveNav]         = useState('today')
  const [search, setSearch]               = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sidebarOpen, setSidebarOpen]     = useState(false)

  const overdue    = tasks.filter((t) => !t.completed && isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)))
  const todayTasks = tasks.filter((t) => isToday(new Date(t.deadline)))
  const upcoming   = tasks.filter((t) => !t.completed && !isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)))
  const completed  = tasks.filter((t) => t.completed)
  const total          = tasks.length
  const completedCount = completed.length
  const progress       = total > 0 ? Math.round((completedCount / total) * 100) : 0

  const counts = {
    today:     todayTasks.length + overdue.length,
    upcoming:  upcoming.length,
    all:       tasks.filter((t) => !t.completed).length,
    completed: completedCount,
  }

  const getFiltered = () => {
    let base = []
    if (activeNav === 'today')     base = [...overdue, ...todayTasks]
    else if (activeNav === 'upcoming') base = upcoming
    else if (activeNav === 'all')  base = tasks.filter((t) => !t.completed)
    else                           base = completed
    return base
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => filterPriority === 'all' || t.priority === filterPriority)
  }

  const filtered = getFiltered()

  const stats = [
    { label: 'Total',   value: total,          color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20',  ring: 'ring-indigo-100 dark:ring-indigo-900/40' },
    { label: 'Today',   value: todayTasks.length, color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-900/20',      ring: 'ring-blue-100 dark:ring-blue-900/40' },
    { label: 'Overdue', value: overdue.length,  color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20',        ring: 'ring-red-100 dark:ring-red-900/40' },
    { label: 'Done',    value: completedCount,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', ring: 'ring-emerald-100 dark:ring-emerald-900/40' },
  ]

  return (
    <div className="flex gap-5 min-h-0">

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {(sidebarOpen) && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-40 flex flex-col p-4 gap-1 lg:hidden"
          >
            <SidebarContent
              navItems={navItems} activeNav={activeNav} counts={counts} progress={progress}
              completedCount={completedCount} total={total}
              onNav={(id) => { setActiveNav(id); setSidebarOpen(false) }}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 gap-1">
        <SidebarContent
          navItems={navItems} activeNav={activeNav} counts={counts} progress={progress}
          completedCount={completedCount} total={total}
          onNav={setActiveNav}
        />
      </aside>

      {/* ── Main panel ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -2 }}
              className={`${s.bg} ring-1 ${s.ring} rounded-2xl p-3.5 text-center cursor-default`}
            >
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            aria-label="Open menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <div className="flex-1 relative min-w-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm"
            />
          </div>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          >
            <option value="all">All Priority</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {/* Add Task — visible on sm+ */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={onAddTask}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </motion.button>
        </div>

        {/* Section heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {navItems.find((n) => n.id === activeNav)?.icon}{' '}
            {navItems.find((n) => n.id === activeNav)?.label}
            {filtered.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
            )}
          </h2>
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-indigo-500 hover:underline">
              Clear search
            </button>
          )}
        </div>

        {/* Task list */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600"
            >
              <div className="text-6xl mb-4">
                {activeNav === 'completed' ? '🏆' : activeNav === 'today' ? '🎯' : '🚀'}
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {activeNav === 'completed' ? 'No completed tasks yet' : 'No tasks here'}
              </p>
              <p className="text-xs mt-1 text-gray-400">
                {activeNav === 'completed' ? 'Complete a task to see it here' : 'Add one to get started!'}
              </p>
              {activeNav !== 'completed' && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onAddTask}
                  className="mt-5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
                >
                  + Add your first task
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeNav}
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="space-y-2.5"
            >
              {filtered.map((t) => (
                <motion.div key={t.id} variants={itemVariants}>
                  <TaskCard task={t} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Extracted sidebar content — shared between mobile drawer and desktop sidebar
function SidebarContent({ navItems, activeNav, counts, progress, completedCount, total, onNav }) {
  return (
    <>
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">
        Views
      </p>

      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNav(item.id)}
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            activeNav === item.id
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <span className="text-base">{item.icon}</span>
            {item.label}
          </span>
          {counts[item.id] > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              activeNav === item.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {counts[item.id]}
            </span>
          )}
        </button>
      ))}

      {/* Progress card */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4">
          <div className="flex justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2.5">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2.5 font-medium">
            {completedCount} of {total} tasks done
          </p>
        </div>
      </div>
    </>
  )
}
