import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerBackVisible: false, // 🔥 ascunde back pentru toate paginile din acest layout
        headerShown: false,
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
