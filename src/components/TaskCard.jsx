import { format, isPast, isToday } from 'date-fns'

const priorityConfig = {
  high: { label: '🔴 High', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  medium: { label: '🟡 Medium', bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
  low: { label: '🟢 Low', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const deadline = new Date(task.deadline)
  const overdue = !task.completed && isPast(deadline)
  const dueToday = isToday(deadline)
  const config = priorityConfig[task.priority] || priorityConfig.medium

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        task.completed
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : overdue
          ? 'bg-red-50 border-red-300'
          : config.bg + ' ' + config.border
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed || false}
          onChange={() => onToggle(task.id)}
          className="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-semibold ${
                task.completed ? 'line-through text-gray-400' : 'text-gray-800'
              }`}
            >
              {task.title}
            </span>
            {overdue && (
              <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium">
                Overdue
              </span>
            )}
            {dueToday && !overdue && !task.completed && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                Due Today
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
              {config.label}
            </span>
            <span className="text-xs text-gray-500">
              📅 {format(deadline, 'MMM d, yyyy · h:mm a')}
            </span>
          </div>

          {task.notes && (
            <p className="text-xs text-gray-500 mt-1 truncate">{task.notes}</p>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-white/70 text-gray-500 hover:text-indigo-600 transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-white/70 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
