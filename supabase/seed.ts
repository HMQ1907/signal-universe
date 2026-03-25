import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function seed() {
  console.log('Seeding Signal Universe database...')

  const passwordHash = await bcrypt.hash('Admin@123', 10)

  const { data, error } = await supabase
    .from('users')
    .upsert({
      email: 'admin@signal-universe.io',
      password_hash: passwordHash,
      full_name: 'Administrator',
      is_admin: true,
      email_verified: true,
      referral_code: 'SUADMIN01'
    }, { onConflict: 'email' })
    .select()

  if (error) {
    console.error('Error seeding admin:', error)
    process.exit(1)
  }

  console.log('Admin user created/updated:', data)
  console.log('\nAdmin credentials:')
  console.log('Email: admin@signal-universe.io')
  console.log('Password: Admin@123')
  console.log('\n⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!')
}

seed()
