export default defineNuxtPlugin(async () => {
  const { init } = useAuth()
  const headers = useRequestHeaders(['cookie']) as Record<string, string>
  await init(headers)
})
