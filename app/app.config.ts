export default defineAppConfig({
  ui: {
    modal: {
      slots: {
        overlay: 'fixed inset-0 z-50 !bg-black/55 backdrop-blur-[2px]',
        content:
          'fixed z-50 flex flex-col bg-[#0f172a] text-slate-100 ring-1 ring-white/10 divide-y divide-white/10 focus:outline-none overflow-hidden shadow-2xl shadow-black/40',
        header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-16 shrink-0 bg-[#0f172a]',
        body: 'flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f172a]',
        footer:
          'flex items-center gap-1.5 p-4 sm:px-6 shrink-0 bg-[#0f172a] border-t border-white/10',
        title: 'text-white font-semibold text-lg pr-8',
        description: 'mt-1 text-slate-400 text-sm',
        close: 'absolute top-4 end-4'
      }
    },
    button: {
      slots: {
        base: 'rounded-xl font-semibold'
      },
      compoundVariants: [
        {
          color: 'neutral',
          variant: 'ghost',
          class:
            'text-slate-200 hover:text-white hover:bg-white/10 active:bg-white/15 focus-visible:bg-white/10 focus-visible:outline-none disabled:opacity-50 disabled:bg-transparent aria-disabled:opacity-50 aria-disabled:bg-transparent [&_svg]:text-current'
        }
      ]
    },
    input: {
      slots: {
        root: 'rounded-xl'
      }
    },
    formField: {
      slots: {
        label: 'block font-medium text-slate-200',
        description: 'text-slate-400',
        hint: 'text-slate-400',
        help: 'text-slate-400'
      }
    },
    badge: {
      slots: {
        base: 'rounded-lg'
      }
    }
  }
})
