import { z } from 'zod'
import { uploadToR2 } from '~~/server/utils/r2'

const schema = z.object({
  file_base64: z.string().min(1),
  file_name: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { file_base64, file_name } = parsed.data
  const supabase = getSupabaseAdmin()

  const matches = file_base64.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!matches) throw createError({ statusCode: 400, message: 'Invalid file format' })

  const contentType = matches[1]
  const buffer = Buffer.from(matches[2], 'base64')

  if (buffer.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, message: 'File quá lớn (tối đa 5MB)' })
  }

  const ext = file_name.split('.').pop()?.toLowerCase() || 'jpg'
  const r2Key = `cccd/user_${user.id}_${Date.now()}.${ext}`

  let publicUrl: string
  try {
    publicUrl = await uploadToR2(r2Key, buffer, contentType)
  } catch (e: any) {
    // Fallback to Supabase Storage if R2 not configured
    if (e.message?.includes('not configured')) {
      const { error: uploadError } = await supabase.storage
        .from('cccd-uploads')
        .upload(`cccd/${user.id}_${Date.now()}.${ext}`, buffer, { contentType, upsert: true })
      if (uploadError) throw createError({ statusCode: 500, message: 'Upload thất bại: ' + uploadError.message })
      const { data: urlData } = supabase.storage.from('cccd-uploads').getPublicUrl(`cccd/${user.id}_${Date.now()}.${ext}`)
      publicUrl = urlData.publicUrl
    } else {
      throw createError({ statusCode: 500, message: 'Upload R2 thất bại: ' + e.message })
    }
  }

  await supabase.from('users').update({ cccd_url: publicUrl }).eq('id', user.id)

  return { success: true, url: publicUrl }
})
