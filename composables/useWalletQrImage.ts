import { computed, ref, watch, type Ref } from 'vue'

/** Match files in `public/images/wallet/` — TRC20 = png, BEP20 = jpg (avoid 404 + router noise on each switch). */
const EXTS_BY_NETWORK: Record<'TRC20' | 'BEP20', readonly string[]> = {
  TRC20: ['png', 'jpg', 'jpeg', 'webp'],
  BEP20: ['jpg', 'jpeg', 'png', 'webp']
}

function addressVariants(network: 'TRC20' | 'BEP20', addr: string): string[] {
  if (network === 'BEP20') return [addr, addr.toLowerCase()]
  return [addr]
}

/**
 * Resolves `/images/wallet/{trc|bep}/{address}.{ext}` then falls back to QR API.
 */
export function useWalletQrImage(
  network: Ref<'TRC20' | 'BEP20'>,
  address: Ref<string>,
  opts?: { size?: number }
) {
  const size = opts?.size ?? 180
  const extIdx = ref(0)
  const variantIdx = ref(0)
  const usingFallback = ref(false)

  watch([network, address], () => {
    extIdx.value = 0
    variantIdx.value = 0
    usingFallback.value = false
  })

  const qrSrc = computed(() => {
    const raw = address.value?.trim()
    if (!raw) return ''
    if (usingFallback.value) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(raw)}`
    }
    const folder = network.value === 'TRC20' ? 'trc' : 'bep'
    const variants = addressVariants(network.value, raw)
    const vi = Math.min(variantIdx.value, variants.length - 1)
    const exts = EXTS_BY_NETWORK[network.value]
    const ext = exts[Math.min(extIdx.value, exts.length - 1)]!
    return `/images/wallet/${folder}/${variants[vi]}.${ext}`
  })

  function onImgError() {
    const raw = address.value?.trim()
    if (!raw) return
    if (usingFallback.value) return
    const variants = addressVariants(network.value, raw)
    const vi = variantIdx.value
    const ei = extIdx.value
    const exts = EXTS_BY_NETWORK[network.value]
    if (ei + 1 < exts.length) {
      extIdx.value++
      return
    }
    if (vi + 1 < variants.length) {
      variantIdx.value++
      extIdx.value = 0
      return
    }
    usingFallback.value = true
  }

  return { qrSrc, onImgError }
}
