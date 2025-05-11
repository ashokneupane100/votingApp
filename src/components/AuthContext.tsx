import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { router } from 'expo-router'
import { ActivityIndicator, View, StyleSheet, Text, Platform } from 'react-native'

// Define the Auth context shape
type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
})

// Provider component to wrap the app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Refresh the session
  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        return
      }
      
      if (data?.session) {
        setSession(data.session)
        setUser(data.session.user)
      } else {
        setSession(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Error during session refresh:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get the current session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting initial session:', error)
          return
        }
        
        setSession(data.session)
        setUser(data.session?.user || null)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(`Supabase auth event: ${event}`)
        
        setSession(newSession)
        setUser(newSession?.user || null)
        
        if (event === 'SIGNED_IN') {
          // Handle successful sign in
          console.log('User signed in')
        } else if (event === 'SIGNED_OUT') {
          // Handle sign out
          console.log('User signed out')
          // We handle navigation in the signOut function
        } else if (event === 'TOKEN_REFRESHED') {
          // Session has been refreshed with a new token
          console.log('Auth token refreshed')
        } else if (event === 'USER_UPDATED') {
          // User data has been updated
          console.log('User data updated')
        } else if (event === 'PASSWORD_RECOVERY') {
          // Handle password recovery flow
          console.log('Password recovery initiated')
        }
        
        setLoading(false)
      }
    )

    // Start auto refresh on mount
    if (Platform.OS !== 'web') {
      supabase.auth.startAutoRefresh()
    }

    // Cleanup subscription on unmount
    return () => {
      if (Platform.OS !== 'web') {
        supabase.auth.stopAutoRefresh()
      }
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        return
      }
      
      // Clear current state
      setUser(null)
      setSession(null)
      
      // Redirect to login page
      router.replace('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  // Context value
  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext)
}

// Protected route component
export function Protected({ children }: { children: ReactNode }) {
  const { user, loading, refreshSession } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      // If we're not sure about the auth state, try to refresh the session
      if (!user && !loading) {
        await refreshSession()
      }
    }
    
    checkAuth()
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      // If not logged in after checking, redirect to login
      router.replace('/login')
    }
  }, [user, loading])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
})