import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = z.string().parse(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseKey = z.string().parse(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
  },
})

export default supabase
