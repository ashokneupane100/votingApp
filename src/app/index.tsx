import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

// Let's make the poll data more realistic
const polls = [
  { id: "1", question: "What is your favorite programming language?" },
  { id: "2", question: "Which framework do you prefer?" },
  { id: "3", question: "How many hours do you code per day?" },
];

const HomeScreen = () => {
  return (
    <>
    <Stack.Screen options={{title:"Polls"
    }}/>
    <FlatList
      data={polls}
      style={{backgroundColor:'gainsboro'}}
      contentContainerStyle={styles.container}
      renderItem={() => (
        <View style={styles.pollContainer}>
          <Text style={styles.pollTitle}>Example Poll Question:</Text>
        </View>
      )}
    />
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "gainsboro",
    padding: 10,
    gap: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  pollContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pollTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
