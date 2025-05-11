import React, { useState } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native'
import { Stack, router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Feather } from '@expo/vector-icons'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  async function handleResetPassword() {
    if (!email.trim()) {
      setMessage({ text: "Please enter your email address", type: 'error' })
      return
    }

    try {
      setLoading(true)
      
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) {
        setMessage({ text: error.message, type: 'error' })
      } else {
        setMessage({ 
          text: "Password reset email sent. Check your inbox for further instructions.", 
          type: 'success' 
        })
      }
    } catch (e: any) {
      setMessage({ text: e.message || "An unexpected error occurred", type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Reset Password" }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.contentContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#333" />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
          
          <View style={styles.formContainer}>
            <Text style={styles.headerText}>Reset Password</Text>
            <Text style={styles.subHeaderText}>
              Enter your email address and we'll send you instructions to reset your password
            </Text>
            
            {message && (
              <View style={[
                styles.messageContainer,
                message.type === 'error' ? styles.errorContainer : styles.successContainer
              ]}>
                <Feather 
                  name={message.type === 'error' ? "alert-circle" : "check-circle"} 
                  size={18} 
                  color={message.type === 'error' ? "#e74c3c" : "#2ecc71"} 
                />
                <Text style={[
                  styles.messageText,
                  message.type === 'error' ? styles.errorText : styles.successText
                ]}>
                  {message.text}
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="email@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              disabled={loading} 
              onPress={handleResetPassword}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>SEND RESET INSTRUCTIONS</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#fdeaea',
  },
  successContainer: {
    backgroundColor: '#e6f9ed',
  },
  messageText: {
    marginLeft: 8,
    flex: 1,
  },
  errorText: {
    color: '#e74c3c',
  },
  successText: {
    color: '#2ecc71',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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