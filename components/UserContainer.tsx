import { useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const UserContainer = () => {
  const { user } = useClerk();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    signOut;
    console.log("signOut pressed");

    try {
      //   await AsyncStorage.removeItem("userId");
      await signOut();
      // Redirect to your desired page
      Linking.openURL(Linking.createURL("/"));
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View>
      <View style={styles.userContainer}>
        <Text style={[styles.userText]}>
          User:{" "}
          <Text style={[styles.userText]} adjustsFontSizeToFit>
            {userEmail || "Loading..."}
          </Text>
        </Text>
        <Ionicons
          name="log-out-outline"
          size={28}
          color="black"
          onPress={() => {
            handleSignOut();
          }}
        />
      </View>
    </View>
  );
};

export default UserContainer;

const styles = StyleSheet.create({
  userContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 16,
    marginRight: 8,
  },
  userText: {
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 12,
    color: "#555",
    // fontFamily: "Inter_500Medium",
  },
});
