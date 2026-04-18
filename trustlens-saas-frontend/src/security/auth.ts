const TOKEN_KEY = 'trustlens.session.token'
const LAST_ACTIVE_KEY = 'trustlens.session.lastActive'
const PROFILE_KEY = 'trustlens.session.profile'

const SESSION_TIMEOUT_MS = 15 * 60 * 1000

export type UserRole = 'Admin' | 'Underwriter' | 'Auditor'

export type SessionProfile = {
  role: UserRole
  displayName: string
}

export function setSession(token: string, profile: SessionProfile) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  touchSession()
}

export function setSessionToken(token: string) {
  setSession(token, { role: 'Underwriter', displayName: 'Demo Operator' })
}

export function getSessionToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getSessionProfile() {
  const profile = sessionStorage.getItem(PROFILE_KEY)
  if (!profile) {
    return null
  }

  try {
    return JSON.parse(profile) as SessionProfile
  } catch {
    return null
  }
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(LAST_ACTIVE_KEY)
  sessionStorage.removeItem(PROFILE_KEY)
}

export function touchSession() {
  sessionStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
}

export function isSessionExpired() {
  const lastActive = sessionStorage.getItem(LAST_ACTIVE_KEY)
  if (!lastActive) {
    return true
  }

  return Date.now() - Number(lastActive) > SESSION_TIMEOUT_MS
}

export function getSessionTimeoutMs() {
  return SESSION_TIMEOUT_MS
}
