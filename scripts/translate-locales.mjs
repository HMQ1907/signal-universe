/**
 * One-off: build locales/ja.json and locales/ko.json from locales/en.json
 * using google-translate-api-x (unique strings only).
 * Run: node scripts/translate-locales.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import translate from 'google-translate-api-x'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const enPath = path.join(root, 'locales', 'en.json')

function flatten(obj, prefix = '') {
  const out = {}
  for (const k of Object.keys(obj)) {
    const pk = prefix ? `${prefix}.${k}` : k
    const v = obj[k]
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, pk))
    } else {
      out[pk] = v
    }
  }
  return out
}

function unflatten(flat) {
  const out = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let cur = out
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i]
      cur[p] = cur[p] ?? {}
      cur = cur[p]
    }
    cur[parts[parts.length - 1]] = value
  }
  return out
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Vue i18n / @intlify only allows ASCII in `{name}` — mask before machine translation. */
const PLACEHOLDER_RE = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g

function maskPlaceholders(text) {
  const names = []
  let i = 0
  const masked = text.replace(PLACEHOLDER_RE, (_, name) => {
    names.push(name)
    return `I18NPH${i++}X`
  })
  return { masked, names }
}

function unmaskPlaceholders(text, names) {
  let out = text
  for (let i = 0; i < names.length; i++) {
    out = out.split(`I18NPH${i}X`).join(`{${names[i]}}`)
  }
  return out
}

async function translateUnique(to) {
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))
  const flat = flatten(en)
  const valueToPaths = new Map()
  for (const [p, val] of Object.entries(flat)) {
    if (typeof val !== 'string') continue
    if (!valueToPaths.has(val)) valueToPaths.set(val, [])
    valueToPaths.get(val).push(p)
  }

  const unique = [...valueToPaths.keys()]
  const translated = new Map()
  console.log(`Translating ${unique.length} unique strings to ${to}...`)

  for (let i = 0; i < unique.length; i++) {
    const text = unique[i]
    const { masked, names } = maskPlaceholders(text)
    try {
      const res = await translate(masked, { from: 'en', to })
      translated.set(text, unmaskPlaceholders(res.text, names))
    } catch (e) {
      console.error(`Fail [${i + 1}/${unique.length}]:`, text.slice(0, 60), e.message)
      translated.set(text, text)
    }
    if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${unique.length}`)
    await sleep(120)
  }

  const outFlat = { ...flat }
  for (const [val, paths] of valueToPaths.entries()) {
    const t = translated.get(val) ?? val
    for (const p of paths) outFlat[p] = t
  }

  return unflatten(outFlat)
}

const ja = await translateUnique('ja')
const ko = await translateUnique('ko')

fs.writeFileSync(path.join(root, 'locales', 'ja.json'), JSON.stringify(ja, null, 2) + '\n', 'utf8')
fs.writeFileSync(path.join(root, 'locales', 'ko.json'), JSON.stringify(ko, null, 2) + '\n', 'utf8')
console.log('Wrote locales/ja.json and locales/ko.json')
