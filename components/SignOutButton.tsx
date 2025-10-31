import { useClerk } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export const SignOutButton = () => {
  const { user } = useClerk();
  if (!user) {
    return;
  }
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/"); // trimite înapoi la index
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };
  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Text>Sign out</Text>
    </TouchableOpacity>
  );
};
