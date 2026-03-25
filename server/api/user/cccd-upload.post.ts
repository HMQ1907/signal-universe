import { z } from 'zod'

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

  const base64Data = file_base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')
  const ext = file_name.split('.').pop()?.toLowerCase() || 'jpg'
  const storagePath = `cccd/${user.id}_${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('cccd-uploads')
    .upload(storagePath, buffer, {
      contentType: `image/${ext}`,
      upsert: true
    })

  if (uploadError) {
    throw createError({ statusCode: 500, message: 'Upload failed: ' + uploadError.message })
  }

  const { data: urlData } = supabase.storage.from('cccd-uploads').getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  await supabase.from('users').update({ cccd_url: publicUrl }).eq('id', user.id)

  return { success: true, url: publicUrl }
})
