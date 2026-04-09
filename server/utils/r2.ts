import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

let _client: S3Client | null = null

export function getR2Client() {
  if (_client) return _client
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured. Set CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY in .env')
  }

  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }
  })
  return _client
}

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const client = getR2Client()
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'signal'

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType
  }))

  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || ''
  return `${publicUrl}/${key}`
}

export async function deleteFromR2(key: string) {
  const client = getR2Client()
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'signal'
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
