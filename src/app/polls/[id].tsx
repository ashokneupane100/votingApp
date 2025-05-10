import { Stack, useLocalSearchParams, router } from "expo-router";
import { View, Text, StyleSheet, Pressable, Button, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function PollDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPoll = async () => {
      try {
        setLoading(true);
        // Fetch the poll
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('*')
          .eq('id', id)
          .single();

        if (pollError) {
          console.error("Error fetching poll:", pollError);
          Alert.alert("Error", "Failed to load poll details");
          setLoading(false);
          return;
        }

        // Fetch the options
        const { data: optionsData, error: optionsError } = await supabase
          .from('options')
          .select('*')
          .eq('poll_id', id);

        if (optionsError) {
          console.error("Error fetching options:", optionsError);
          Alert.alert("Error", "Failed to load poll options");
          setLoading(false);
          return;
        }

        setPoll(pollData);
        setOptions(optionsData || []);
      } catch (err) {
        console.error("Error loading poll data:", err);
        Alert.alert("Error", "Something went wrong loading the poll");
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id]);

  const vote = async () => {
    if (!selected) {
      Alert.alert("Error", "Please select an option");
      return;
    }

    try {
      setSubmitting(true);
      
      // Record the vote in the database
      const { error } = await supabase
        .from('votes')
        .insert({
          option_id: selected,
          poll_id: id,
          // You might want to include user_id if you have authentication
        });

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Your vote has been recorded!", [
        {
          text: "OK",
          onPress: () => router.replace("/")
        }
      ]);
    } catch (err) {
      console.error("Error submitting vote:", err);
      Alert.alert("Error", "Failed to submit your vote");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading poll...</Text>
      </View>
    );
  }

  if (!poll) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Poll not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: poll.question }} />

      <Text style={styles.question}>{poll.question}</Text>

      <View style={{ gap: 5 }}>
        {options.map((option) => (
          <Pressable
            onPress={() => setSelected(option.id)}
            key={option.id}
            style={styles.optionContainer}
          >
            <Feather
              name={option.id === selected ? "check-circle" : "circle"}
              size={18}
              color={option.id === selected ? "green" : "gray"}
            />
            <Text>{option.text}</Text>
          </Pressable>
        ))}
      </View>
      
      <Button 
        onPress={vote} 
        title={submitting ? "Submitting..." : "Vote"} 
        disabled={submitting || !selected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 10,
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
  },
  optionContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});