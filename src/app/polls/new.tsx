import { Stack, router } from "expo-router";
import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useState } from "react";
import { Feather } from '@expo/vector-icons';
import { supabase } from "../../lib/supabase";
import { Protected } from "../../components/AuthContext";

function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const formErrors: Record<string, string> = {};
    
    // Validate question
    if (!question.trim()) {
      formErrors.question = "Please enter a question";
    }

    // Validate options
    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      formErrors.options = "Please provide at least two options";
    }
    
    // Check for duplicate options
    const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== validOptions.length) {
      formErrors.options = "All options must be unique";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  
  const createPoll = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setCreating(true);
      
      // Filter out empty options
      const validOptions = options.filter(opt => opt.trim().length > 0);
      
      // Insert the poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          question: question.trim(),
          options: validOptions,
          createdAt: new Date().toISOString()
        })
        .select();

      if (pollError) throw pollError;
      
      if (!pollData || pollData.length === 0) {
        throw new Error("Failed to create poll: No data returned");
      }

      Alert.alert(
        "Success", 
        "Poll created successfully!", 
        [
          {
            text: "OK",
            onPress: () => router.replace("/")
          }
        ]
      );
    } catch (error: any) {
      console.error("Error creating poll:", error);
      Alert.alert("Error", `Failed to create poll: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };
  
  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setErrors({...errors, options: "You need at least two options"});
      return;
    }
    
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
    
    // Clear option error if there are at least 2 options left
    if (errors.options && updatedOptions.filter(opt => opt.trim().length > 0).length >= 2) {
      const { options, ...rest } = errors;
      setErrors(rest);
    }
  };

  const updateOption = (text: string, index: number) => {
    const updatedOptions = [...options];
    updatedOptions[index] = text;
    setOptions(updatedOptions);
    
    // Clear option error if typing
    if (errors.options) {
      const { options, ...rest } = errors;
      setErrors(rest);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidView}
    >
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: "Create New Poll" }} />
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Question</Text>
            <TextInput
              onChangeText={(text) => {
                setQuestion(text);
                if (errors.question) {
                  const { question, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              value={question}
              placeholder="Type your question here"
              style={[
                styles.input,
                errors.question ? styles.inputError : null
              ]}
            />
            {errors.question && (
              <Text style={styles.errorText}>{errors.question}</Text>
            )}
          </View>

          <View style={styles.optionsSection}>
            <Text style={styles.label}>Options:</Text>
            
            {errors.options && (
              <Text style={styles.errorText}>{errors.options}</Text>
            )}

            {options.map((option, index) => (
              <View key={index} style={styles.optionContainer}>
                <TextInput
                  value={option}
                  onChangeText={(text) => updateOption(text, index)}
                  placeholder={`Option ${index+1}`}
                  style={styles.optionInput}
                />
                <TouchableOpacity
                  onPress={() => removeOption(index)}
                  style={styles.deleteButton}
                >
                  <Feather name="x" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <TouchableOpacity onPress={addOption} style={styles.addButton}>
            <Feather name="plus" size={16} color="white" />
            <Text style={styles.addButtonText}>Add option</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={createPoll} 
            style={[
              styles.createButton,
              creating && styles.disabledButton
            ]}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.createButtonText}>Create Poll</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Protected wrapper component
export default function ProtectedCreatePoll() {
  return (
    <Protected>
      <CreatePoll />
    </Protected>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  optionsSection: {
    marginBottom: 16,
  },
  optionContainer: {
    position: 'relative',
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionInput: {
    backgroundColor: "white",
    padding: 12,
    paddingRight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    fontSize: 16,
  },
  deleteButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  addButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
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