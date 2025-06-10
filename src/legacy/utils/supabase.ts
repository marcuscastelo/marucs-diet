import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

import env from '~/shared/config/env'
import { parseWithStack } from '~/shared/utils/parseWithStack'
const supabaseUrl = parseWithStack(z.string(), env.VITE_NEXT_PUBLIC_SUPABASE_URL)
const supabaseAnonKey = parseWithStack(z.string(), env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
