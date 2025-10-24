// import { useOAuth, useSignIn } from "@clerk/clerk-expo";
// import { Link, useRouter } from "expo-router";
// import React from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export default function Page() {
//   const { signIn, setActive, isLoaded } = useSignIn();
//   const router = useRouter();

//   const [emailAddress, setEmailAddress] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

//   const onPressGoogle = async () => {
//     try {
//       const { createdSessionId, setActive } = await startOAuthFlow();
//       if (createdSessionId) {
//         await setActive({ session: createdSessionId });
//       }
//     } catch (err) {
//       console.error("OAuth error:", err);
//     }
//   };

//   const onSignInPress = async () => {
//     if (!isLoaded) return;

//     try {
//       const signInAttempt = await signIn.create({
//         identifier: emailAddress,
//         password,
//       });

//       if (signInAttempt.status === "complete") {
//         await setActive({ session: signInAttempt.createdSessionId });
//         router.replace("/");
//       } else {
//         console.error(JSON.stringify(signInAttempt, null, 2));
//       }
//     } catch (err) {
//       console.error(JSON.stringify(err, null, 2));
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <Text style={styles.title}>Sign In</Text>

//       <TextInput
//         style={styles.input}
//         autoCapitalize="none"
//         autoCorrect={false}
//         keyboardType="email-address"
//         placeholder="Email"
//         value={emailAddress}
//         onChangeText={setEmailAddress}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       <TouchableOpacity style={styles.button} onPress={onSignInPress}>
//         <Text style={styles.buttonText}>Continue</Text>
//       </TouchableOpacity>

//       <View style={styles.footer}>
//         <Text style={styles.footerText}>Don't have an account? </Text>
//         <Link href="/sign-up" style={styles.footerLink}>
//           Sign up
//         </Link>
//         <TouchableOpacity
//           onPress={onPressGoogle}
//           style={{
//             backgroundColor: "#DB4437",
//             padding: 12,
//             borderRadius: 8,
//             marginTop: 16,
//           }}
//         >
//           <Text
//             style={{ color: "white", textAlign: "center", fontWeight: "600" }}
//           >
//             Continuă cu Google
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     justifyContent: "center",
//     backgroundColor: "#ffffff",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#333",
//     alignSelf: "center",
//     marginBottom: 30,
//   },
//   input: {
//     height: 50,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     fontSize: 16,
//     backgroundColor: "#f9f9f9",
//   },
//   button: {
//     backgroundColor: "#3a8e3d",
//     paddingVertical: 15,
//     borderRadius: 8,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   footer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 20,
//   },
//   footerText: {
//     fontSize: 14,
//     color: "#555",
//   },
//   footerLink: {
//     fontSize: 14,
//     color: "#3a8e3d",
//     fontWeight: "bold",
//   },
// });

import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
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

      <TouchableOpacity
        onPress={onSignInPress}
        style={{
          backgroundColor: "#3a8e3d",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
          Continuă
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
        <Text>Nu ai cont?</Text>
        <Link href="/sign-up">
          <Text style={{ color: "#3a8e3d", fontWeight: "bold" }}>
            Înregistrează-te
          </Text>
        </Link>
      </View>
    </View>
  );
}
