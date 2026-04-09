export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()
  if (!user.value?.is_admin) return navigateTo('/admin')
})
