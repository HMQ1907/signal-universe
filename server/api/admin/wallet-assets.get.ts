import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { requireAdminOrSubAdmin } from '~~/server/utils/supabase'

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

export type WalletAssetItem = {
  address: string
  src: string
}

async function listWalletFolder(sub: 'trc' | 'bep'): Promise<WalletAssetItem[]> {
  const dir = join(process.cwd(), 'public', 'images', 'wallet', sub)
  let names: string[]
  try {
    names = await readdir(dir)
  } catch {
    return []
  }

  const byKey = new Map<string, WalletAssetItem>()
  for (const name of names) {
    const lastDot = name.lastIndexOf('.')
    if (lastDot < 1) continue
    const extLower = name.slice(lastDot).toLowerCase()
    if (!IMAGE_EXTS.has(extLower)) continue
    const address = name.slice(0, lastDot)
    if (!address) continue

    const dedupeKey = sub === 'bep' ? address.toLowerCase() : address
    if (byKey.has(dedupeKey)) continue

    const src = `/images/wallet/${sub}/${encodeURIComponent(name)}`
    byKey.set(dedupeKey, { address, src })
  }

  return [...byKey.values()].sort((a, b) => a.address.localeCompare(b.address))
}

export default defineEventHandler(async (event) => {
  await requireAdminOrSubAdmin(event)
  const [trc, bep] = await Promise.all([listWalletFolder('trc'), listWalletFolder('bep')])
  return { trc, bep }
})
