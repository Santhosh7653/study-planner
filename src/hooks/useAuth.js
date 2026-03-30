import { useState, useEffect } from 'react'

const USERS_KEY = 'study-planner-users'
const SESSION_KEY = 'study-planner-session'

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY)
      return session ? JSON.parse(session) : null
    } catch {
      return null
    }
  })

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || []
    } catch {
      return []
    }
  }

  const signup = ({ username, email, password }) => {
    const users = getUsers()
    if (users.find((u) => u.email === email)) {
      return { error: 'An account with this email already exists.' }
    }
    if (users.find((u) => u.username === username)) {
      return { error: 'Username is already taken.' }
    }
    const newUser = { id: crypto.randomUUID(), username, email, password }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
    const session = { id: newUser.id, username: newUser.username, email: newUser.email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setCurrentUser(session)
    return { success: true }
  }

  const login = ({ email, password }) => {
    const users = getUsers()
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) {
      return { error: 'Invalid email or password.' }
    }
    const session = { id: user.id, username: user.username, email: user.email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setCurrentUser(session)
    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setCurrentUser(null)
  }

  return { currentUser, login, signup, logout }
}
