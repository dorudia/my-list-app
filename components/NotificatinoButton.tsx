import { useNotifications } from "@/store/notification-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, Text, View } from "react-native";

const NotificatinoButton = () => {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(
    (n) => !n.read && n.delivered
  ).length;

  return (
    <Pressable
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Platform.OS === "android" ? "#efefef" : "",
          width: 42,
          aspectRatio: 1,
          borderRadius: 50,
          transform: [{ scale: pressed ? 1.4 : 1 }],
        },
      ]}
      onPress={() => {
        console.log("notification");
      }}
    >
      <Ionicons
        name="notifications-outline"
        size={24}
        color="#323232"
        onPress={() => {
          router.push("/notificationList");
        }}
        style={{
          paddingHorizontal: 4,
          marginBottom: Platform.OS === "ios" ? 6 : 0,
        }}
      />
      {/* Badge */}
      {unreadCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "red",
            width: 15,
            height: 15,
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 8, fontWeight: "bold" }}>
            {unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default NotificatinoButton;
