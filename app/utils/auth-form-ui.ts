/** Shared Nuxt UI `ui` overrides for auth pages (padding + icon insets). */
export const authCardUi = {
  root: 'overflow-hidden bg-transparent ring-0 shadow-none',
  header: 'border-b border-white/5 px-6 pb-5 pt-8 sm:px-10 sm:pb-6 sm:pt-10',
  body: 'px-6 py-8 sm:px-10 sm:py-10',
  footer: 'border-t border-white/5 px-6 py-6 sm:px-10 sm:py-8 bg-black/20'
} as const

/**
 * Nuxt UI Input (lg): theme applies `px-3` on the native input AND compound variants add `ps-10` / `pe-10`
 * for leading/trailing icons. Tailwind merge order can let `px-3` win on the inline-start/end axis so text
 * draws under the icons. Force logical padding with important modifiers.
 */
const baseLgLeadingOnly =
  'min-w-0 py-2 text-sm !ps-11 !pe-3 sm:!ps-12 sm:!pe-4'

const baseLgLeadingTrailing =
  'min-w-0 py-2 text-sm !ps-11 !pe-14 sm:!ps-12 sm:!pe-16'

/** No leading icon (e.g. phone digits next to country picker) — do not use leading icon inset padding. */
const baseLgPlain =
  'min-w-0 py-2 text-sm !ps-3 !pe-3 sm:!ps-4 sm:!pe-4 text-start'

export const authInputUiPlain = {
  base: `${baseLgPlain} text-slate-100 placeholder:text-slate-400`
} as const

/** Full absolute positioning: merged `ui.leading`/`trailing` must not drop theme `end-0`/`start-0` (tailwind-merge / tv). */
export const authInputUiLeading = {
  base: `${baseLgLeadingOnly} text-slate-100 placeholder:text-slate-400`,
  leading:
    'pointer-events-none absolute inset-y-0 start-0 z-[1] flex items-center ps-3 sm:ps-3.5 text-slate-300',
  leadingIcon: 'text-slate-300'
} as const

export const authInputUiPassword = {
  base: `${baseLgLeadingTrailing} text-slate-100 placeholder:text-slate-400`,
  leading:
    'pointer-events-none absolute inset-y-0 start-0 z-[1] flex items-center ps-3 sm:ps-3.5 text-slate-300',
  trailing: 'absolute inset-y-0 end-0 z-[2] flex items-center justify-center pe-1 sm:pe-1.5',
  leadingIcon: 'text-slate-300'
} as const
