import { useState, useEffect } from 'react'
import { format, isPast, isToday } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

const priorityConfig = {
  high: {
    dot:    'bg-red-500',
    badge:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    border: 'border-l-red-500',
    glow:   'hover:shadow-red-100/60 dark:hover:shadow-red-900/20',
    label:  'High',
  },
  medium: {
    dot:    'bg-amber-400',
    badge:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    border: 'border-l-amber-400',
    glow:   'hover:shadow-amber-100/60 dark:hover:shadow-amber-900/20',
    label:  'Medium',
  },
  low: {
    dot:    'bg-emerald-500',
    badge:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    border: 'border-l-emerald-400',
    glow:   'hover:shadow-emerald-100/60 dark:hover:shadow-emerald-900/20',
    label:  'Low',
  },
}

function useCountdown(deadline) {
  const [remaining, setRemaining] = useState(() => deadline - Date.now())

  useEffect(() => {
    const tick = () => setRemaining(deadline - Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])

  return remaining
}

function CountdownTimer({ deadline, completed }) {
  const ms = useCountdown(deadline)

  if (completed) return null

  const overdue = ms < 0
  const abs = Math.abs(ms)
  const totalSecs = Math.floor(abs / 1000)
  const days  = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const mins  = Math.floor((totalSecs % 3600) / 60)
  const secs  = totalSecs % 60

  const pad = n => String(n).padStart(2, '0')

  let display
  if (days > 0) {
    display = `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`
  } else {
    display = `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`
  }

  // Color logic based on time remaining
  let colorClass
  if (overdue) {
    colorClass = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'
  } else if (ms < 3600_000) {
    // < 1 hour — red
    colorClass = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'
  } else if (ms < 86400_000) {
    // < 24 hours — amber
    colorClass = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40'
  } else if (ms < 3 * 86400_000) {
    // < 3 days — indigo
    colorClass = 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40'
  } else {
    // plenty of time — muted
    colorClass = 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-600/40'
  }

  return (
    <div className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-1.5 ${colorClass}`}>
      {/* Clock icon */}
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" strokeLinecap="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
      </svg>

      <span className="text-xs font-mono font-semibold tracking-wide">
        {overdue ? `Overdue by ${display}` : display}
      </span>

      {/* Pulsing dot for last hour */}
      {!overdue && ms < 3600_000 && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      )}
    </div>
  )
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const deadline = new Date(task.deadline)
  const overdue  = !task.completed && isPast(deadline) && !isToday(deadline)
  const dueToday = !task.completed && isToday(deadline)
  const cfg      = priorityConfig[task.priority] || priorityConfig.medium

  const timeLabel = format(deadline, 'MMM d · h:mm a')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.97 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ duration: 0.18 }}
      className={[
        'group relative bg-white dark:bg-gray-800/80 rounded-2xl',
        'border border-gray-100 dark:border-gray-700/60 border-l-4', cfg.border,
        'p-4 shadow-sm hover:shadow-lg transition-all duration-200',
        cfg.glow,
        task.completed ? 'opacity-50' : '',
        overdue ? '!border-l-red-500 bg-red-50/30 dark:bg-red-900/10' : '',
        dueToday ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={() => onToggle(task.id)}
          className={[
            'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
            task.completed
              ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-transparent shadow-sm'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400',
          ].join(' ')}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-16">
          {/* Title */}
          <p className={`text-sm font-semibold leading-snug ${
            task.completed
              ? 'line-through text-gray-400 dark:text-gray-500'
              : 'text-gray-800 dark:text-gray-100'
          }`}>
            {task.title}
          </p>

          {/* Subject tag */}
          {task.subject && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mt-1.5">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {task.subject}
            </span>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Priority badge */}
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>

            {/* Due date */}
            <span className={`text-xs flex items-center gap-1 ${
              overdue
                ? 'text-red-500 dark:text-red-400 font-semibold'
                : dueToday
                ? 'text-indigo-500 dark:text-indigo-400 font-medium'
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {timeLabel}
            </span>

            {/* Calendar synced */}
            {task.eventId && (
              <span className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1 font-medium">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Synced
              </span>
            )}
          </div>

          {/* Notes preview */}
          {task.notes && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-1 leading-relaxed">
              {task.notes}
            </p>
          )}

          {/* Countdown timer */}
          <CountdownTimer deadline={deadline.getTime()} completed={task.completed} />
        </div>
      </div>

      {/* Status ribbon */}
      {(overdue || dueToday) && !task.completed && (
        <div className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
          overdue
            ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
            : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300'
        }`}>
          {overdue ? '⚠ Overdue' : '📌 Today'}
        </div>
      )}

      {/* Action buttons — revealed on hover (desktop) / always visible (touch) */}
      {(!overdue && !dueToday) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => onEdit(task)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            title="Edit task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
            </svg>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => onDelete(task.id)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="Delete task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
            </svg>
          </motion.button>
        </div>
      )}

      {/* Overdue/Today actions */}
      {(overdue || dueToday) && !task.completed && (
        <div className="absolute right-[84px] top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => onEdit(task)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            title="Edit task"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
            </svg>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => onDelete(task.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="Delete task"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
            </svg>
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
