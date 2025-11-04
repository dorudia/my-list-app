import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignInScreen() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const attempt = await signIn.create({
        identifier: email,
        password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/addList"); // redirect după login
      } else {
        Alert.alert(
          "Autentificare incompletă",
          "Vă rugăm să verificați email-ul și parola."
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Eroare la autentificare",
        err.errors?.[0]?.longMessage || err.message
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 80} // ajustează după nevoie
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Autentificare
        </Text>

        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Parolă"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        />

        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
          <Text
            style={{ color: "#3a8e3d", textAlign: "center", marginBottom: 16 }}
          >
            Ai uitat parola?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSignInPress}
          style={{
            backgroundColor: "#3a8e3d",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text
            style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}
          >
            Continuă
          </Text>
        </TouchableOpacity>

        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}
        >
          <Text>Nu ai cont?</Text>
          <Link href="/sign-up">
            <Text style={{ color: "#3a8e3d", fontWeight: "bold" }}>
              Înregistrează-te
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
