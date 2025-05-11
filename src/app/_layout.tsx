import { Stack } from "expo-router";
import { AuthProvider } from "../components/AuthContext";
import { useEffect } from "react";
import { AppState } from "react-native";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
  // Set up AppState listener for auth refresh management
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    // Start auto refresh on mount
    supabase.auth.startAutoRefresh();

    // Clean up on unmount
    return () => {
      subscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#333333',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#f5f5f5',
          },
        }}
      />
    </AuthProvider>
  );
}