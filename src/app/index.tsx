import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack, Link } from "expo-router";
import { AntDesign } from "@expo/vector-icons";


// Let's make the poll data more realistic
const polls = [
  { id: "1", question: "Gagan Thapa" },
  { id: "2", question: "Balen Shah" },
  { id: "3", question: "Harke Haldaar" },
];

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: "भोट दिनुहोस",
        headerRight: () => (
          <Link href={"/polls/new"}>
            <AntDesign name="plus" size={20} color="gray" />
          </Link>
        )
      }} />
      <FlatList
        data={polls}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10, gap: 5 }}
        renderItem={({ item }) => (
          <Link href={`/polls/${item.id}`}>
            <View style={styles.pollContainer}>
              <Text style={styles.pollTitle}>{item.question}</Text>
            </View>
          </Link>
        )}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "gainsboro",
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
    marginTop: 20,
  },
  pollTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
});