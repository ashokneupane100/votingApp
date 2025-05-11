import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, Link, router } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { Tables } from "../types/supabase";
import { Protected, useAuth } from "../components/AuthContext";

type Poll = Tables<"polls">;

function HomeScreen() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('polls')
          .select('*')
          .order('createdAt', { ascending: false });
          
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

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          onPress: signOut
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "भोट दिनुहोस",
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Link href="/polls/new" asChild>
                <TouchableOpacity style={styles.iconButton}>
                  <AntDesign name="plus" size={22} color="#2196F3" />
                </TouchableOpacity>
              </Link>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={handleSignOut}
              >
                <Feather name="log-out" size={22} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.email?.split('@')[0] || 'User'}!
        </Text>
      </View>
      
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
              <TouchableOpacity style={styles.pollContainer}>
                <Text style={styles.pollTitle}>{item.question}</Text>
                <View style={styles.pollMeta}>
                  <Text style={styles.pollDate}>
                    {new Date(item.createdAt || '').toLocaleDateString()}
                  </Text>
                  <Text style={styles.pollOptions}>
                    {item.options?.length || 0} options
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No polls found</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/polls/new')}
              >
                <Text style={styles.createButtonText}>Create New Poll</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

// Protected wrapper component
export default function ProtectedHomeScreen() {
  return (
    <Protected>
      <HomeScreen />
    </Protected>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  welcomeContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  pollContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
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
    marginBottom: 8,
    color: '#333',
  },
  pollMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pollDate: {
    fontSize: 12,
    color: '#666',
  },
  pollOptions: {
    fontSize: 12,
    color: '#666',
  },
});