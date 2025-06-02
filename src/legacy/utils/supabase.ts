import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import env from '~/shared/config/env'
const supabaseUrl = z
  .string({
    description: 'The URL of the Supabase project',
  })
  .parse(env.VITE_NEXT_PUBLIC_SUPABASE_URL)
const supabaseKey = z
  .string({
    description: 'The public key of the Supabase project',
  })
  .parse(env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY)
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
  },
})

export function registerSubapabaseRealtimeCallback(
  table: string,
  callback: (payload: unknown) => void,
): void {
  supabase
    .channel(table)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
}
export default supabase
