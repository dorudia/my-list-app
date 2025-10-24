// import { useSignUp } from "@clerk/clerk-expo";
// import { Link, useRouter } from "expo-router";
// import * as React from "react";
// import { Text, TextInput, TouchableOpacity, View } from "react-native";

// export default function SignUpScreen() {
//   const { isLoaded, signUp, setActive } = useSignUp();
//   const router = useRouter();

//   const [emailAddress, setEmailAddress] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const [pendingVerification, setPendingVerification] = React.useState(false);
//   const [code, setCode] = React.useState("");

//   // Handle submission of sign-up form
//   const onSignUpPress = async () => {
//     if (!isLoaded) return;

//     // Start sign-up process using email and password provided
//     try {
//       await signUp.create({
//         emailAddress,
//         password,
//       });

//       // Send user an email with verification code
//       await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

//       // Set 'pendingVerification' to true to display second form
//       // and capture OTP code
//       setPendingVerification(true);
//     } catch (err) {
//       // See https://clerk.com/docs/custom-flows/error-handling
//       // for more info on error handling
//       console.error(JSON.stringify(err, null, 2));
//     }
//   };

//   // Handle submission of verification form
//   const onVerifyPress = async () => {
//     if (!isLoaded) return;

//     try {
//       // Use the code the user provided to attempt verification
//       const signUpAttempt = await signUp.attemptEmailAddressVerification({
//         code,
//       });

//       // If verification was completed, set the session to active
//       // and redirect the user
//       if (signUpAttempt.status === "complete") {
//         await setActive({ session: signUpAttempt.createdSessionId });
//         router.replace("/");
//       } else {
//         // If the status is not complete, check why. User may need to
//         // complete further steps.
//         console.error(JSON.stringify(signUpAttempt, null, 2));
//       }
//     } catch (err) {
//       // See https://clerk.com/docs/custom-flows/error-handling
//       // for more info on error handling
//       console.error(JSON.stringify(err, null, 2));
//     }
//   };

//   if (pendingVerification) {
//     return (
//       <>
//         <Text>Verify your email</Text>
//         <TextInput
//           value={code}
//           placeholder="Enter your verification code"
//           onChangeText={(code) => setCode(code)}
//         />
//         <TouchableOpacity onPress={onVerifyPress}>
//           <Text>Verify</Text>
//         </TouchableOpacity>
//       </>
//     );
//   }

//   return (
//     <View>
//       <>
//         <Text>Sign up</Text>
//         <TextInput
//           autoCapitalize="none"
//           value={emailAddress}
//           placeholder="Enter email"
//           onChangeText={(email) => setEmailAddress(email)}
//         />
//         <TextInput
//           value={password}
//           placeholder="Enter password"
//           secureTextEntry={true}
//           onChangeText={(password) => setPassword(password)}
//         />
//         <TouchableOpacity onPress={onSignUpPress}>
//           <Text>Continue</Text>
//         </TouchableOpacity>
//         <View style={{ display: "flex", flexDirection: "row", gap: 3 }}>
//           <Text>Already have an account?</Text>
//           <Link href="/sign-in">
//             <Text>Sign in</Text>
//           </Link>
//         </View>
//       </>
//     </View>
//   );
// }

import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Verify your email</Text>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter your verification code"
          onChangeText={setCode}
        />
        <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Email"
        value={emailAddress}
        onChangeText={setEmailAddress}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/sign-in" style={styles.footerLink}>
          Sign in
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    alignSelf: "center",
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#3a8e3d",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
  footerLink: {
    fontSize: 14,
    color: "#3a8e3d",
    fontWeight: "bold",
  },
});
