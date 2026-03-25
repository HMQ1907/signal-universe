export default defineAppConfig({
  ui: {
    primary: 'indigo',
    gray: 'slate',
    button: {
      rounded: 'rounded-xl',
      default: {
        size: 'md'
      }
    },
    input: {
      rounded: 'rounded-xl',
      default: {
        size: 'md'
      }
    },
    card: {
      rounded: 'rounded-2xl',
      background: 'bg-slate-900',
      ring: 'ring-1 ring-slate-800',
      shadow: 'shadow-none'
    },
    badge: {
      rounded: 'rounded-lg'
    },
    modal: {
      rounded: 'rounded-2xl',
      background: 'bg-slate-900',
      ring: 'ring-1 ring-slate-800'
    },
    table: {
      wrapper: 'overflow-x-auto',
      th: {
        base: 'text-left',
        color: 'text-slate-400',
        background: 'bg-slate-800/50',
        padding: 'px-4 py-3'
      },
      td: {
        padding: 'px-4 py-3'
      }
    },
    select: {
      rounded: 'rounded-xl'
    }
  }
})
