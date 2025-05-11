import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, Link, router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { Tables } from "../types/supabase";

type Poll = Tables<"polls">;

const HomeScreen = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('polls')
          .select('*');
          
        if (error) {
          console.error("Supabase error:", error);
          Alert.alert("Error", "Failed to fetch polls");
          return;
        }
        
        setPolls(data || []);
      } catch (err) {
        console.error("Error in fetching polls:", err);
        Alert.alert("Error", "Failed to load polls");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPolls();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "भोट दिनुहोस",
          headerTitleAlign:"center",
          headerRight: () => (
            <Link href="/polls/new" asChild>
              <AntDesign name="plus" size={20} color="gray" />
            </Link>
          ),
          headerLeft:()=>(
             <Link href="/login" asChild>
              <AntDesign name="user" size={20} color="gray" />
            </Link>

          )
        }}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading polls...</Text>
        </View>
      ) : (
        <FlatList
          data={polls}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Link href={`/polls/${item.id}`} asChild>
              <View style={styles.pollContainer}>
                <Text style={styles.pollTitle}>{item.question}</Text>
              </View>
            </Link>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text>No polls found. Create a new one!</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "gainsboro",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
    paddingTop: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
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