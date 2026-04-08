interface AuthUser {
  id: number
  email: string
  full_name: string | null
  is_admin: boolean
  balance: number
  locked_capital: number
  investment_package: number | null
  first_deposit_at: string | null
  referral_code: string
  f1_count: number
  cccd_url: string | null
}

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth:user', () => null)
  const initialized = useState<boolean>('auth:initialized', () => false)
  const toast = useToastCustom()

  const init = async (headers?: Record<string, string>) => {
    if (initialized.value) return
    try {
      const res = await $fetch.raw<AuthUser>('/api/user/profile', {
        ignoreResponseError: true,
        headers,
      })
      user.value = res.ok ? (res._data ?? null) : null
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  const login = async (email: string, password: string) => {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = { ...data.user, f1_count: 0, first_deposit_at: null, cccd_url: null }
    initialized.value = true

    if (data.user.is_admin) {
      await navigateTo('/admin')
    } else {
      await navigateTo('/dashboard')
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      initialized.value = false
      await navigateTo('/auth/login')
    }
  }

  const refreshUser = async () => {
    try {
      const data = await $fetch<AuthUser>('/api/user/profile')
      user.value = data
    } catch {
      user.value = null
    }
  }

  return { user: readonly(user), init, login, logout, refreshUser }
}
