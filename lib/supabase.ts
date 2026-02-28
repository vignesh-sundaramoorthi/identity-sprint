import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Public client (for inserts from the form)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client (for reading all applications in admin)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  global: {
    fetch: (url, options = {}) =>
      fetch(url, { ...options, cache: 'no-store' }),
  },
})
