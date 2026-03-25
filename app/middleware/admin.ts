export default defineNuxtRouteMiddleware(async () => {
  const { user, init } = useAuth()
  if (!user.value) await init()
  if (!user.value) return navigateTo('/auth/login')
  if (!user.value.is_admin) return navigateTo('/dashboard')
})
