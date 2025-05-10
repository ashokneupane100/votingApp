import { Stack, router } from "expo-router";
import { Text, View, StyleSheet, TextInput, Button, Alert, ActivityIndicator } from "react-native";
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
      
      // Insert the poll first
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          question: question,
          // Add any additional fields like created_by if you have auth
        })
        .select();

      if (pollError) {
        throw new Error(pollError.message);
      }

      const pollId = pollData[0].id;

      // Insert all options
      const optionsToInsert = validOptions.map(option => ({
        text: option,
        poll_id: pollId
      }));

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) {
        throw new Error(optionsError.message);
      }

      Alert.alert("Success", "Poll created successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/")
        }
      ]);
    } catch (error) {
      console.error("Error creating poll:", error);
      Alert.alert("Error", `Failed to create poll: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };
  
  return (
    <View style={styles.container}>
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
            onChangeText={(text) => {
              const updated = [...options];
              updated[index] = text;
              setOptions(updated);
            }}
            placeholder={`Option ${index+1}`}
            style={styles.optionInput}
          />
          <Feather 
            name="x" 
            size={20} 
            color="black" 
            onPress={() => {
              if (options.length > 2) {
                const updated = [...options];
                updated.splice(index, 1);
                setOptions(updated);
              } else {
                Alert.alert("Error", "You need at least two options");
              }
            }}
            style={styles.deleteIcon} 
          />
        </View>
      ))}
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Add option" 
          onPress={() => setOptions([...options, ""])} 
        />
        <Button 
          onPress={createPoll} 
          title={creating ? "Creating..." : "Create Poll"} 
          disabled={creating}
        />
      </View>
      
      {creating && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 5,
    flex: 1,
  },
  label: {
    fontWeight: "500",
    marginTop: 10,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  optionContainer: {
    position: 'relative',
    marginVertical: 5,
  },
  optionInput: {
    backgroundColor: "white",
    padding: 10,
    paddingRight: 40,
    borderRadius: 10,
  },
  deleteIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  }
});