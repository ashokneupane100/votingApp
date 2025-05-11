import React, { useState, useEffect } from 'react'
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

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Clear error message when inputs change
  useEffect(() => {
    if (errorMessage) setErrorMessage(null)
  }, [password, confirmPassword])

  async function handleUpdatePassword() {
    // Reset messages
    setErrorMessage(null)
    setSuccessMessage(null)
    
    // Validate input
    if (!password || !confirmPassword) {
      setErrorMessage("Please enter both fields")
      return
    }
    
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters")
      return
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }
    
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setErrorMessage(error.message)
      } else {
        setSuccessMessage("Password updated successfully")
        
        // Clear form
        setPassword('')
        setConfirmPassword('')
        
        // Show success message and redirect
        Alert.alert(
          "Success", 
          "Your password has been updated. You can now log in with your new password.", 
          [
            { 
              text: "Go to Login", 
              onPress: () => router.replace("/login") 
            }
          ]
        )
      }
    } catch (e: any) {
      setErrorMessage(e.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Update Password" }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.headerText}>Create New Password</Text>
            <Text style={styles.subHeaderText}>
              Enter and confirm your new password
            </Text>
            
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={18} color="#e74c3c" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
            
            {successMessage && (
              <View style={styles.successContainer}>
                <Feather name="check-circle" size={18} color="#2ecc71" />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry={!showPassword}
                  placeholder="Enter new password"
                  autoCapitalize="none"
                  style={styles.passwordInput}
                  textContentType="newPassword"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Feather 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="gray" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  onChangeText={setConfirmPassword}
                  value={confirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm new password"
                  autoCapitalize="none"
                  style={styles.passwordInput}
                  textContentType="newPassword"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <Feather 
                    name={showConfirmPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="gray" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              disabled={loading} 
              onPress={handleUpdatePassword}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>UPDATE PASSWORD</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    justifyContent: 'center',
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdeaea',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: '#e74c3c',
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f9ed',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    marginLeft: 8,
    color: '#2ecc71',
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    backgroundColor: "#f9f9f9",
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
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});