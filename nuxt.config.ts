export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  nitro: {},

  modules: ['@nuxt/ui', '@vueuse/nuxt', '@nuxtjs/i18n'],

  colorMode: {
    preference: 'dark'
  },

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'vi', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'zh', name: '中文', file: 'zh.json' },
      { code: 'ms', name: 'Bahasa Melayu', file: 'ms.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' }
    ],
    defaultLocale: 'en',
    langDir: '../locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    vueI18n: '../i18n/i18n.config.ts'
  },

  css: ['~/assets/css/main.css'],

  imports: {
    dirs: ['composables', 'composables/**']
  },

  routeRules: {
    '/auth/**': { headers: { 'cache-control': 'no-store' } },
    '/api/auth/**': { headers: { 'cache-control': 'no-store' } },
    '/dashboard/**': { headers: { 'cache-control': 'no-store' } },
    '/api/user/**': { headers: { 'cache-control': 'no-store' } },
    '/api/wallet/**': { headers: { 'cache-control': 'no-store' } },
    '/api/signals/**': { headers: { 'cache-control': 'no-store' } },
    '/api/referral/**': { headers: { 'cache-control': 'no-store' } },
    '/api/admin/**': { headers: { 'cache-control': 'no-store' } }
  },

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    emailFrom: process.env.EMAIL_FROM || 'noreply@signal-universe.io',
    siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      siteName: 'Signal Universe',
      siteDescription: 'Smart Trading Signal Platform',
      telegramSupportLink: process.env.TELEGRAM_SUPPORT_LINK || 'https://t.me/signal_universe'
    }
  },

  app: {
    head: {
      title: 'Signal Universe - Smart Trading Signal Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Signal Universe - Smart Trading Signal Platform' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/logo.png' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  typescript: {
    strict: true
  }
})
