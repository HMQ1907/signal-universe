export default defineNuxtRouteMiddleware(async () => {
  const { user, init } = useAuth()
  if (!user.value) await init()
  if (user.value) {
    return navigateTo(user.value.is_admin ? '/admin' : '/dashboard')
  }
})
