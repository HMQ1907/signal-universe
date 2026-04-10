/** `/wallet` has no real page — avoid empty page + `navigateTo` in setup (Vue slot / RouterView warnings). */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/wallet' || to.path === '/wallet/') {
    return navigateTo({ path: '/wallet/deposit', query: to.query, hash: to.hash }, { replace: true })
  }
})
