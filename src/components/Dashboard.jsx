import { isToday, isPast, isTomorrow } from 'date-fns'
import TaskCard from './TaskCard'

export default function Dashboard({ tasks, onEdit, onDelete, onToggle }) {
  const today = tasks.filter((t) => isToday(new Date(t.deadline)))
  const overdue = tasks.filter((t) => !t.completed && isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)))
  const upcoming = tasks.filter((t) => !isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)))

  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Today', value: today.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Overdue', value: overdue.length, color: 'bg-red-50 text-red-700' },
          { label: 'Done', value: completed, color: 'bg-green-50 text-green-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <Section title="⚠️ Overdue" count={overdue.length} accent="text-red-600">
          {overdue.map((t) => (
            <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
          ))}
        </Section>
      )}

      {/* Today */}
      <Section title="📅 Today" count={today.length} accent="text-indigo-600">
        {today.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No tasks due today. Enjoy the break! 🎉</p>
        ) : (
          today.map((t) => (
            <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
          ))
        )}
      </Section>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Section title="🗓️ Upcoming" count={upcoming.length} accent="text-gray-600">
          {upcoming.map((t) => (
            <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, count, accent, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className={`font-semibold text-sm ${accent}`}>{title}</h3>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
