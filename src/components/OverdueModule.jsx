import { useState } from 'react'
import { isPast, isToday } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from './TaskCard'

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export default function OverdueModule({ tasks, onEdit, onDelete, onToggle, search, filterPriority }) {
  const overdue = tasks.filter((t) => !t.completed && isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)))

  const filtered = overdue
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => filterPriority === 'all' || t.priority === filterPriority)

  return (
    <AnimatePresence mode="wait">
      {filtered.length === 0 ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600"
        >
          <div className="text-6xl mb-4">✅</div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            No overdue tasks
          </p>
          <p className="text-xs mt-1 text-gray-400">
            You're all caught up!
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="overdue"
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
  )
}