const accessTokenKey = 'inventory.accessToken'

export function getSessionToken(): string | null {
  return typeof window === 'undefined'
    ? null
    : window.sessionStorage.getItem(accessTokenKey)
}

export function saveSessionToken(token: string): void {
  window.sessionStorage.setItem(accessTokenKey, token)
}

export function clearSessionToken(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(accessTokenKey)
  }
}
