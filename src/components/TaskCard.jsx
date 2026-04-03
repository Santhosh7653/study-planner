import { format, isPast, isToday } from 'date-fns'
import { motion } from 'framer-motion'

const priorityConfig = {
  high: {
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    border: 'border-l-red-400',
    label: 'High',
  },
  medium: {
    dot: 'bg-orange-400',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    border: 'border-l-orange-400',
    label: 'Medium',
  },
  low: {
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    border: 'border-l-green-400',
    label: 'Low',
  },
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const deadline = new Date(task.deadline)
  const overdue = !task.completed && isPast(deadline) && !isToday(deadline)
  const dueToday = isToday(deadline)
  const cfg = priorityConfig[task.priority] || priorityConfig.medium

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 border-l-4 ${cfg.border} p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        task.completed ? 'opacity-50' : ''
      } ${overdue ? '!border-l-red-500 bg-red-50/30 dark:bg-red-900/10' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            task.completed
              ? 'bg-indigo-600 border-indigo-600'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Priority badge */}
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>

            {/* Date */}
            <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
              📅 {format(deadline, 'MMM d · h:mm a')}
            </span>

            {/* Status badges */}
            {overdue && (
              <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                Overdue
              </span>
            )}
            {dueToday && !overdue && !task.completed && (
              <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                Due Today
              </span>
            )}
          </div>

          {task.notes && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 truncate">{task.notes}</p>
          )}
        </div>

        {/* Actions — visible on hover */}
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(task)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
            </svg>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(task.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
