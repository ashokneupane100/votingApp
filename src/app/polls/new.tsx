import { Stack, router } from "expo-router";
import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  Button, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView
} from "react-native";
import { useState } from "react";
import { Feather } from '@expo/vector-icons';
import { supabase } from "../../lib/supabase";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);
  
  const createPoll = async () => {
    // Validate inputs
    if (!question.trim()) {
      Alert.alert("Error", "Please enter a question");
      return;
    }

    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      Alert.alert("Error", "Please provide at least two options");
      return;
    }

    try {
      setCreating(true);
      
      // Insert the poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          question: question,
          options: validOptions, // Store options directly in the poll record
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
      Alert.alert("Error", "You need at least two options");
      return;
    }
    
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
  };

  const updateOption = (text: string, index: number) => {
    const updatedOptions = [...options];
    updatedOptions[index] = text;
    setOptions(updatedOptions);
  };
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "Create New Poll" }} />
      
      <Text style={styles.label}>Question</Text>
      <TextInput
        onChangeText={setQuestion}
        value={question}
        placeholder="Type your question here"
        style={styles.input}
      />

      <Text style={styles.label}>Options:</Text>

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
            <Feather name="x" size={20} color="black" />
          </TouchableOpacity>
        </View>
      ))}
      
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={addOption} style={styles.addButton}>
          <Feather name="plus" size={16} color="white" />
          <Text style={styles.addButtonText}>Add option</Text>
        </TouchableOpacity>
      </View>
      
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  },
  deleteButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  addButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 6,
  },
  createButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});