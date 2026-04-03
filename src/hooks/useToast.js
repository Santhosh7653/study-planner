import { useState, useCallback } from 'react'

let id = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const newId = ++id
    setToasts((prev) => [...prev, { id: newId, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== newId)), 3000)
  }, [])

  const remove = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }, [])

  return { toasts, toast, remove }
}
