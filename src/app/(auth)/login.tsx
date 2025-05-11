import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, Text, TextInput, TouchableOpacity } from 'react-native'
import { supabase } from '../../lib/supabase'
import { Feather } from '@expo/vector-icons'

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password")
      return
    }
    
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error.message)
        Alert.alert("Sign In Error", error.message)
      }
    } catch (e) {
      console.error("Unexpected error during sign in:", e)
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  async function signUpWithEmail() {
    // Validate input
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password")
      return
    }
    
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }
    
    try {
      setLoading(true)
      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // You can add additional data here if needed
          // data: { first_name: "John", last_name: "Doe" }
        }
      })

      if (error) {
        console.error("Sign up error:", error.message)
        Alert.alert("Sign Up Error", error.message)
        return
      }
      
      // Check if session exists (immediate sign-in) or needs email verification
      if (data?.session) {
        Alert.alert("Success", "Signed up and logged in successfully!")
      } else {
        Alert.alert("Success", "Please check your email for the confirmation link")
      }
    } catch (e) {
      console.error("Unexpected error during sign up:", e)
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={{fontWeight:'500', fontSize: 18, marginBottom: 16}}>Sign In or create an account:</Text>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
          style={styles.input}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <View style={styles.passwordContainer}>
          <TextInput
            onChangeText={setPassword}
            value={password}
            secureTextEntry={!showPassword}
            placeholder="Password"
            autoCapitalize={'none'}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather 
              name={showPassword ? "eye" : "eye-off"} 
              size={20} 
              color="gray" 
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          disabled={loading} 
          onPress={signInWithEmail}
        >
          <Text style={styles.buttonText}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.verticallySpaced}>
        <TouchableOpacity 
          style={[styles.button, styles.signUpButton, loading && styles.buttonDisabled]} 
          disabled={loading} 
          onPress={signUpWithEmail}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});