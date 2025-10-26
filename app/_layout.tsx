import NotificationProvider from "@/store/notification-context";
import TodoProvider from "@/store/todo-context";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const clerkKey = Constants.expoConfig?.extra?.clerkPublishableKey;

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    const testServer = async () => {
      try {
        // const res = await fetch("http://localhost:3000/test");    // din emulator
        const res = await fetch("http://192.168.0.100:3000/test"); // din telefon
        const data = await res.json();
        console.log("✅ Răspuns server:", data);
      } catch (error) {
        console.log("❌ Eroare la conectarea cu serverul:", error);
      }
    };
    testServer();
  }, []);

  return (
    <SafeAreaProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <TodoProvider>
          <NotificationProvider>
            <StatusBar barStyle="dark-content" />
            <View
              style={{
                flex: 1,
                width: Platform.OS === "web" ? "50%" : "100%",
                marginHorizontal: Platform.OS === "web" ? "auto" : undefined,
                padding: Platform.OS === "web" ? 40 : 0,
              }}
            >
              <Stack
                screenOptions={{
                  headerTitleAlign: "left",
                  headerTintColor: "#314797",
                  headerBackVisible: true,
                  headerBackTitle: "Back",
                  // headerStyle: { backgroundColor: "#ffdafd" },
                  headerShadowVisible: false,
                  // contentStyle: { backgroundColor: "#ffdafd" },
                  headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 20,
                  },
                  animation: "slide_from_right",
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="addList"
                  options={{
                    title: "Select List",
                  }}
                />
                <Stack.Screen
                  name="list/[list]"
                  options={{ title: "Add Todo" }}
                />
                <Stack.Screen
                  name="id/[id]"
                  options={{
                    // headerShown: false,
                    title: "Edit Todo",
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="notificationList"
                  options={{ title: "Notifications" }}
                />
              </Stack>
            </View>
          </NotificationProvider>
        </TodoProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
