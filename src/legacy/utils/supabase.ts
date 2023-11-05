import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
console.debug(`[supabase] env: ${JSON.stringify(import.meta.env)}`)
const supabaseUrl = z
  .string({
    description: 'The URL of the Supabase project',
  })
  .parse(import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL)
const supabaseKey = z
  .string({
    description: 'The public key of the Supabase project',
  })
  .parse(import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY)
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
  },
})

export default supabase
