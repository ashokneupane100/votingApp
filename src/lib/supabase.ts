import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Database } from "../types/supabase"
import Constants from 'expo-constants'

// Get the environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// Fallback to the .env file values if not available in process.env
const fallbackUrl = 'https://bmwvjskhhqiwjyarfpuz.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtd3Zqc2toaHFpd2p5YXJmcHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODkwNDMsImV4cCI6MjA2MjQ2NTA0M30.7F-xiSbHYY_Jw94djYcPOTD-AFyjMmV7ufm1_i7rvjA'

// Use the URL and key from process.env, Constants.expoConfig.extra, or fallback
const finalSupabaseUrl = supabaseUrl || 
  (Constants.expoConfig?.extra?.supabaseUrl as string) || 
  fallbackUrl

const finalSupabaseAnonKey = supabaseAnonKey || 
  (Constants.expoConfig?.extra?.supabaseAnonKey as string) || 
  fallbackKey

if (!finalSupabaseUrl || !finalSupabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

// For web SSR, check if window is defined
const isServer = typeof window === 'undefined'

export const supabase = createClient<Database>(
  finalSupabaseUrl, 
  finalSupabaseAnonKey, 
  {
    auth: {
      storage: isServer ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: !isServer, // Only enable for client-side
    },
  }
)

// Helper functions for votes
export const addVote = async (pollId: number, optionValue: string, userId?: string) => {
  return supabase.from('votes').insert({
    poll_id: pollId,
    option_value: optionValue,
    voter_id: userId,
    created_at: new Date().toISOString(),
  })
}

export const getVotesByPoll = async (pollId: number) => {
  return supabase
    .from('votes')
    .select('option_value, count(*)')
    .eq('poll_id', pollId)
    .group('option_value')
}