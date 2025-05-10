import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

const poll = {
  question: "React Native vs Flutter ?",
  options: ["React Native FTW", "Flutter", "SwiftUI"],
};

export default function PollDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{poll.question}</Text>

      <View style={{gap:5}}>
        {poll.options.map((option) => (
          <View key={option} style={styles.optionContainer}>
            <Text>{option}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap:10,
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
  },
  optionContainer: {
    backgroundColor: "white",
    padding:10,
    borderRadius:5,
  },
});
