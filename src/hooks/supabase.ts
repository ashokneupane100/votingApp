import { useEffect, useState } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'


const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: SupabaseClient | null = null

export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  
  useEffect(() => {
    if (!supabaseInstance && typeof window !== 'undefined') {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
      setSupabase(supabaseInstance)
    } else if (supabaseInstance) {
      setSupabase(supabaseInstance)
    }
  }, [])

  return supabase
}