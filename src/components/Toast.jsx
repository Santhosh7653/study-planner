import { AnimatePresence, motion } from 'framer-motion'

const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
}

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-indigo-500',
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${colors[t.type]}`}
          >
            <span>{icons[t.type]}</span>
            <span>{t.message}</span>
            <button
              onClick={() => onRemove(t.id)}
              className="ml-2 opacity-70 hover:opacity-100 text-white"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
