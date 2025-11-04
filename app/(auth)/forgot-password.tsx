import { useSignIn, useClerk } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ForgotPasswordScreen() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [stage, setStage] = useState("request"); // "request" → "verify"
  const { setActive } = useClerk();

  const handleRequestReset = async () => {
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStage("verify");
      Alert.alert("Verifică emailul", "Ți-am trimis un cod de resetare.");
    } catch (err) {
      const error = err as any;
      Alert.alert(
        "Eroare",
        error.errors?.[0]?.longMessage || error.message || "Eroare necunoscută"
      );
    }
  };

  const handleResetPassword = async () => {
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });
      if (result?.status === "complete") {
        await setActive({ session: result.createdSessionId }); // ✅ setează sesiunea activă
        Alert.alert("Succes", "Parola a fost resetată!");
        router.replace("/"); // sau altă pagină principală
      }
    } catch (err) {
      const error = err as any;

      Alert.alert(
        "Eroare",
        error?.errors?.[0]?.longMessage || error?.message || err
      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      {stage === "request" ? (
        <>
          <Text style={{ fontSize: 22, marginBottom: 12 }}>
            Recuperare parolă
          </Text>
          <TextInput
            placeholder="Email"
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
          <TouchableOpacity
            onPress={handleRequestReset}
            style={{ backgroundColor: "#3a8e3d", padding: 12, borderRadius: 8 }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Trimite cod
            </Text>
          </TouchableOpacity>
          <Link href="/sign-in" style={{ marginTop: 18, textAlign: "center" }}>
            Go back
          </Link>
        </>
      ) : (
        <>
          <Text style={{ fontSize: 22, marginBottom: 12 }}>
            Setează parola nouă
          </Text>
          <TextInput
            placeholder="Cod primit pe email"
            value={code}
            onChangeText={setCode}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          />
          <TextInput
            placeholder="Parolă nouă"
            value={newPassword}
            secureTextEntry
            onChangeText={setNewPassword}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          />
          <TouchableOpacity
            onPress={handleResetPassword}
            style={{ backgroundColor: "#3a8e3d", padding: 12, borderRadius: 8 }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Resetează parola
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
