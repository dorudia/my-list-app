import { useUser } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // pentru iOS
    shouldShowList: true, // pentru iOS (notification center)
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Index() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    // Nu facem nimic până se încarcă Clerk
    if (!isLoaded) return;

    // ✅ navigatorul trebuie să fie montat, deci punem un mic delay
    const timeout = setTimeout(() => {
      if (isSignedIn && isLoaded && user) {
        // Dacă utilizatorul e logat, mergem la ecranul principal
        router.replace("/addList");
      } else {
        // Dacă nu e logat, mergem la ecranul de sign-in
        router.replace("/(auth)/sign-in");
      }
    }, 50); // 50ms e suficient pentru montarea navigatorului

    // Cleanup timeout dacă componenta se demontează înainte să expire
    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn]);

  // 👇 Dacă Clerk încă încarcă, afișăm un ecran de tip Splash (indicator)
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 👇 După ce navigatorul e montat și Clerk a încărcat, acest return poate fi gol
  // Sau poți afișa un mic mesaj de bun venit înainte de redirect
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
