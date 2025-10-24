import NotificationProvider from "@/store/notification-context";
import TodoProvider from "@/store/todo-context";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const clerkKey = Constants.expoConfig?.extra?.clerkPublishableKey;

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <SafeAreaProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <TodoProvider>
          <NotificationProvider>
            <StatusBar barStyle="dark-content" />
            <Stack
              screenOptions={{
                headerTitleAlign: "center",
                headerTintColor: "#414141",
                // headerStyle: {
                //   backgroundColor: "#76c84a",
                // },
                headerBackVisible: true,
                headerBackTitle: "Back",
                headerStyle: { backgroundColor: "#f8feff" },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: "#f8feff" },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="addList" options={{ title: "Select List" }} />
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
              <Stack.Screen name="notificationList" />
            </Stack>
          </NotificationProvider>
        </TodoProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
