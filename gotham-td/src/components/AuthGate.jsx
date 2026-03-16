import { useCallback, useEffect, useState } from 'react'
import { Card, Typography } from 'antd'
import AuthScreen from './AuthScreen.jsx'
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from '../utils/storage.js'

const { Text } = Typography

export default function AuthGate({ children, messageApi, notificationApi }) {
  const [authToken, setAuthToken] = useState(() => getStoredAuthToken())
  const [currentUser, setCurrentUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authChecking, setAuthChecking] = useState(Boolean(getStoredAuthToken()))
  const [authSubmitting, setAuthSubmitting] = useState(false)

  const resetSessionState = useCallback(() => {
    clearStoredAuthToken()
    setAuthToken('')
    setCurrentUser(null)
    setAuthChecking(false)
  }, [])

  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = new Headers(options.headers || {})
      if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`)
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (response.status === 401) {
        resetSessionState()
        setAuthError('Your session has expired. Please sign in again.')
      }

      return response
    },
    [authToken, resetSessionState],
  )

  useEffect(() => {
    if (!authToken) {
      setAuthChecking(false)
      return
    }

    const restoreSession = async () => {
      try {
        setAuthChecking(true)
        const res = await authFetch('/api/auth/me')
        if (!res.ok) {
          throw new Error('Unable to restore session')
        }

        const data = await res.json()
        setCurrentUser(data.user)
        setAuthError('')
      } catch {
        resetSessionState()
      } finally {
        setAuthChecking(false)
      }
    }

    restoreSession()
  }, [authFetch, authToken, resetSessionState])

  const handleAuthFieldChange = useCallback((field, value) => {
    setAuthForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleAuthSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setAuthSubmitting(true)
      setAuthError('')

      try {
        const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
        const payload =
          authMode === 'login'
            ? { email: authForm.email, password: authForm.password }
            : authForm

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data.message || 'Authentication failed')
        }

        setStoredAuthToken(data.token)
        setAuthToken(data.token)
        setCurrentUser(data.user)
        setAuthForm({ name: '', email: '', password: '' })
        setAuthError('')
        notificationApi.success({
          message: authMode === 'login' ? 'Signed in' : 'Account created',
          description: `${data.user.name} is now authenticated as ${data.user.role}.`,
        })
      } catch (err) {
        setAuthError(err.message)
      } finally {
        setAuthSubmitting(false)
      }
    },
    [authForm, authMode, notificationApi],
  )

  const handleLogout = useCallback(async () => {
    try {
      if (authToken) {
        await authFetch('/api/auth/logout', { method: 'POST' })
      }
    } catch {
      // Clearing local session state is sufficient here.
    } finally {
      resetSessionState()
      setAuthMode('login')
      messageApi.success('Signed out')
    }
  }, [authFetch, authToken, messageApi, resetSessionState])

  if (authChecking) {
    return (
      <div className="auth-loading">
        <Card variant="borderless">
          <Text>Restoring secure session...</Text>
        </Card>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <AuthScreen
        mode={authMode}
        form={authForm}
        error={authError}
        submitting={authSubmitting}
        onModeChange={(mode) => {
          setAuthMode(mode)
          setAuthError('')
        }}
        onChange={handleAuthFieldChange}
        onSubmit={handleAuthSubmit}
      />
    )
  }

  return children({
    authFetch,
    currentUser,
    handleLogout,
    isPrivilegedUser:
      currentUser.role === 'admin' || currentUser.role === 'super_admin',
  })
}
