export const AUTH_STORAGE_KEY = 'gotham_registry_auth_token'

export function getStoredAuthToken() {
  return localStorage.getItem(AUTH_STORAGE_KEY) || ''
}

export function setStoredAuthToken(token) {
  localStorage.setItem(AUTH_STORAGE_KEY, token)
}

export function clearStoredAuthToken() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
