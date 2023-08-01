import { createClient } from '@supabase/supabase-js'

const supabaseUrl = '***REMOVED***'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey as string)

export default supabase
