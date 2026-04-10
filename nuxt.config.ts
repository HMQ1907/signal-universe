export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  nitro: {},

  modules: ['@nuxt/ui', '@vueuse/nuxt', '@nuxtjs/i18n'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'vi', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'zh', name: '中文', file: 'zh.json' },
      { code: 'ms', name: 'Bahasa Melayu', file: 'ms.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' },
      { code: 'ja', name: '日本語', file: 'ja.json' },
      { code: 'ko', name: '한국어', file: 'ko.json' }
    ],
    defaultLocale: 'en',
    /** Paths relative to srcDir (app/): ../locales → project locales/, ../i18n → project i18n/ */
    langDir: '../locales',
    strategy: 'no_prefix',
    /** English by default; do not follow browser Accept-Language (often vi-VN). User choice still saved via LanguageSwitcher. */
    detectBrowserLanguage: false,
    vueI18n: '../i18n/i18n.config.ts',
    bundle: {
      optimizeTranslationDirective: false
    }
  },

  css: ['~/assets/css/main.css'],

  imports: {
    /** app/composables + project-root composables (Nuxt 4 srcDir is app/) */
    dirs: ['composables', 'composables/**', '../composables', '../composables/**']
  },

  routeRules: {
    '/admin/pending': { redirect: '/admin/deposits' },
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
    /**
     * Do NOT use `mode: 'out-in'` globally — with Nuxt layout changes (e.g. landing → default)
     * it can leave the DOM stuck on the previous page while the URL updates (Vue transition + LayoutLoader).
     * Keep a light opacity transition without out-in; disable layout transition to avoid double-wrapping issues.
     */
    pageTransition: { name: 'page' },
    layoutTransition: false
  },

  typescript: {
    strict: true,
    /** Merged into `.nuxt/tsconfig.app.json` (Vue / @vue/typescript-plugin reads `vueCompilerOptions` here). */
    tsConfig: {
      compilerOptions: {
        plugins: [{ name: '@vue/typescript-plugin' }]
      },
      vueCompilerOptions: {
        strictTemplates: false,
        strictVModel: false,
        strictCssModules: false,
        checkUnknownProps: false,
        checkUnknownEvents: false,
        checkUnknownDirectives: false,
        checkUnknownComponents: false,
        skipTemplateCodegen: false,
        target: 3.5
      }
    }
  }
})
