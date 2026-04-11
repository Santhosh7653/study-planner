import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const defaultForm = { title: '', deadline: '', priority: 'medium', notes: '' }

const priorityOptions = [
  { value: 'high',   label: 'High',   emoji: '🔴', active: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700' },
  { value: 'medium', label: 'Medium', emoji: '🟡', active: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700' },
  { value: 'low',    label: 'Low',    emoji: '🟢', active: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700' },
]

const inputClass = (hasError) =>
  `w-full border rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${
    hasError ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
  }`

export default function TaskModal({ open, onClose, onSubmit, editTask }) {
  const [form, setForm]     = useState(defaultForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(editTask
        ? { title: editTask.title, deadline: editTask.deadline, priority: editTask.priority, notes: editTask.notes || '' }
        : defaultForm
      )
      setErrors({})
    }
  }, [editTask, open])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.deadline)     e.deadline = 'Deadline is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit(form)
    onClose()
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet on mobile, centered modal on sm+ */}
          <motion.div
            className="relative w-full sm:max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-gray-900 sm:rounded-2xl rounded-t-3xl shadow-2xl z-10"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editTask ? 'Edit Task' : 'New Task'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editTask ? 'Update your task details' : 'Add a new task to your planner'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    Task Title *
                  </label>
                  <input
                    name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g. Study Chapter 5 – Physics"
                    className={inputClass(errors.title)}
                    autoFocus
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.title}
                    </p>
                  )}
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local" name="deadline" value={form.deadline} onChange={handleChange}
                    className={inputClass(errors.deadline)}
                  />
                  {errors.deadline && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.deadline}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    Priority
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {priorityOptions.map((opt) => (
                      <motion.button
                        key={opt.value}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setForm((f) => ({ ...f, priority: opt.value }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                          form.priority === opt.value
                            ? opt.active + ' border-current shadow-sm scale-[1.03]'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                        }`}
                      >
                        {opt.emoji} {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    Notes
                  </label>
                  <textarea
                    name="notes" value={form.notes} onChange={handleChange}
                    rows={2} placeholder="Optional notes or reminders..."
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit" whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/40"
                  >
                    {editTask ? '✓ Update Task' : '+ Add Task'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
