import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const defaultForm = { title: '', subject: '', deadline: '', priority: 'medium', notes: '' }

const priorityOptions = [
  {
    value: 'high', label: 'High', icon: '🔴',
    active: 'bg-red-50 text-red-700 border-red-400 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600',
    dot: 'bg-red-500',
  },
  {
    value: 'medium', label: 'Medium', icon: '🟡',
    active: 'bg-amber-50 text-amber-700 border-amber-400 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600',
    dot: 'bg-amber-400',
  },
  {
    value: 'low', label: 'Low', icon: '🟢',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600',
    dot: 'bg-emerald-500',
  },
]

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  )
}

const inputCls = (hasErr) =>
  `w-full border rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 transition-all placeholder-gray-400 dark:placeholder-gray-500 ${
    hasErr
      ? 'border-red-400 focus:ring-red-300 dark:border-red-600'
      : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-400 focus:border-indigo-400'
  }`

export default function TaskModal({ open, onClose, onSubmit, editTask }) {
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(editTask
        ? {
            title: editTask.title,
            subject: editTask.subject || '',
            deadline: editTask.deadline,
            priority: editTask.priority,
            notes: editTask.notes || '',
          }
        : defaultForm
      )
      setErrors({})
    }
  }, [editTask, open])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.deadline) e.deadline = 'Deadline is required'
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
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto bg-white dark:bg-gray-900 sm:rounded-3xl rounded-t-3xl shadow-2xl z-10"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>

            <div className="p-6 sm:p-7">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editTask ? 'Edit Task' : 'New Task'}
                  </h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                    {editTask ? 'Update your task details below' : 'Add a new task to your planner'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-0.5"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <Field label="Task title" required error={errors.title}>
                  <input
                    name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g. Study Chapter 5 – Physics"
                    className={inputCls(errors.title)}
                    autoFocus autoComplete="off"
                  />
                </Field>

                {/* Subject */}
                <Field label="Subject / Course">
                  <input
                    name="subject" value={form.subject} onChange={handleChange}
                    placeholder="e.g. Mathematics, Biology..."
                    className={inputCls(false)}
                    autoComplete="off"
                  />
                </Field>

                {/* Deadline */}
                <Field label="Deadline" required error={errors.deadline}>
                  <input
                    type="datetime-local" name="deadline" value={form.deadline} onChange={handleChange}
                    className={inputCls(errors.deadline)}
                  />
                </Field>

                {/* Priority */}
                <Field label="Priority">
                  <div className="grid grid-cols-3 gap-2">
                    {priorityOptions.map((opt) => (
                      <motion.button
                        key={opt.value}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setForm((f) => ({ ...f, priority: opt.value }))}
                        className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all flex items-center justify-center gap-1.5 ${
                          form.priority === opt.value
                            ? opt.active + ' shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </Field>

                {/* Notes */}
                <Field label="Notes">
                  <textarea
                    name="notes" value={form.notes} onChange={handleChange}
                    rows={3} placeholder="Optional notes, links, or reminders..."
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none transition placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </Field>

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
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 flex items-center justify-center gap-2"
                  >
                    {editTask ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Update Task
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Task
                      </>
                    )}
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
