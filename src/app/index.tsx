import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, Link, router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

const HomeScreen = () => {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        console.log("Fetching Now... ");
        
        const { data, error } = await supabase
          .from('polls')
          .select('*');
          
        if (error) {
          console.error("Supabase error:", error);
          Alert.alert("Error Fetching data");
          return;
        }
        
        console.log(data);
        setPolls(data || []);
      } catch (err) {
        console.error("Error in fetching polls:", err);
        Alert.alert("Error", "Failed to load polls");
      }
    };
    
    fetchPolls();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "भोट दिनुहोस",
          headerRight: () => (
            <Link href={"/polls/new"}>
              <AntDesign name="plus" size={20} color="gray" />
            </Link>
          ),
        }}
      />
      <FlatList
        data={polls}
        keyExtractor={(item) => item.id.toString()}
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