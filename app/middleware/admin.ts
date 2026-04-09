export default defineNuxtRouteMiddleware(async () => {
  const { user, init } = useAuth()
  if (!user.value) await init()
  if (!user.value) return navigateTo('/auth/login')
  if (!user.value.is_admin && !user.value.is_sub_admin) return navigateTo('/dashboard')
})
