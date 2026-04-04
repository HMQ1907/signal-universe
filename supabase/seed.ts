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

  const adminHash = await bcrypt.hash('Admin@123', 10)
  const userHash = await bcrypt.hash('User@123', 10)

  const { data: adminData, error: adminError } = await supabase
    .from('users')
    .upsert(
      {
        email: 'admin@signal-universe.io',
        password_hash: adminHash,
        full_name: 'Administrator',
        is_admin: true,
        is_active: true,
        email_verified: true,
        balance: 0,
        referral_code: 'SUADMIN01'
      },
      { onConflict: 'email' }
    )
    .select()

  if (adminError) {
    console.error('Error seeding admin:', adminError)
    process.exit(1)
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .upsert(
      {
        email: 'user@signal-universe.io',
        password_hash: userHash,
        full_name: 'Test User',
        is_admin: false,
        is_active: true,
        email_verified: true,
        balance: 1000,
        referral_code: 'SUUSER01'
      },
      { onConflict: 'email' }
    )
    .select()

  if (userError) {
    console.error('Error seeding test user:', userError)
    process.exit(1)
  }

  console.log('Admin user created/updated:', adminData)
  console.log('Test user created/updated:', userData)
  console.log('\nAdmin: admin@signal-universe.io / Admin@123')
  console.log('User:  user@signal-universe.io / User@123')
  console.log('\n⚠️  CHANGE PASSWORDS AFTER FIRST LOGIN!')
}

seed()
