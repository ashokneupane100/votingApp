import { Stack } from "expo-router";
import { Text, View, StyleSheet, TextInput, Button } from "react-native";
import { useState } from "react";
import { Feather } from '@expo/vector-icons';

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["1", "2"]);
  
  const createPoll = () => {
    console.log("create");
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Create New Poll" }} />
      <Text style={styles.label}>Title</Text>
      <TextInput
        onChangeText={setQuestion}
        value={question}
        placeholder="Type your question here:"
        style={styles.input}
      />

      <Text style={styles.label}>Options:</Text>

      {options.map((option, index) => (
        <View key={index} style={{justifyContent:"center"}}>
          <TextInput
            value={option}
            onChangeText={(text) => {
              const updated = [...options];
              updated[index] = text;
              setOptions(updated);
            }}
            placeholder={`Option ${index+1}`}
            style={styles.input}
          />
          <Feather 
            name="x" 
            size={20} 
            color="black" 
            onPress={()=>{

                //delete options based on index
                const updated=[...options];
                updated.splice(index,1)
                setOptions(updated);

            }}
            style={{position:'absolute', right:10, top:10}} 
          />
        </View>
      ))}
      
      <Button title="Add option" onPress={() => setOptions([...options, ""])} />
      <Button onPress={createPoll} title="Create Poll" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 5,
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
});