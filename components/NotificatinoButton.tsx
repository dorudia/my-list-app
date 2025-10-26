import { useNotifications } from "@/store/notification-context";
import { useTodos } from "@/store/todo-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Button,
  Pressable,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

const NotificatinoButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { bgColor, setBackgroundColor } = useTodos();
  // const [bgColor, setBgColor] = useState("#fff");
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(
    (n) => !n.read && n.delivered
  ).length;

  useEffect(() => {
    console.log(bgColor);
  }, [bgColor]);

  return (
    <View style={{ flexDirection: "row" }}>
      <Pressable
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Platform.OS === "android" ? "#ffffff90" : "",
            width: 42,
            aspectRatio: 1,
            borderRadius: 50,
            transform: [{ scale: pressed ? 1.4 : 1 }],
            marginRight: 8,
          },
        ]}
        onPress={() => {
          setModalVisible(true);
        }}
      >
        <Ionicons
          name="color-palette-outline"
          size={24}
          color="#323232"
          style={{
            paddingHorizontal: 4,
            marginBottom: Platform.OS === "ios" ? 6 : 0,
          }}
        />
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Platform.OS === "android" ? "#ffffff90" : "",
            width: 42,
            aspectRatio: 1,
            borderRadius: 50,
            transform: [{ scale: pressed ? 1.4 : 1 }],
          },
        ]}
        onPress={() => {
          router.push("/notificationList");
        }}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color="#323232"
          // onPress={() => {
          //   router.push("/notificationList");
          // }}
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
      <Modal visible={modalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 10,
              width: "90%",
              alignItems: "center",
            }}
          >
            <Text
              adjustsFontSizeToFit
              style={{ marginBottom: 24, fontSize: 18 }}
            >
              Select color
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              {[
                "#fff",
                "#f9e2de",
                "#e9f9ea",
                "#ecf2ff",
                "#e9f5ff",
                "#fff8e6",
                "#ffffef",
                "#e9e0f7",
              ].map((color) => (
                <Pressable
                  key={color}
                  onPress={() => {
                    setBackgroundColor(color);
                    setModalVisible(false);
                  }}
                  style={{
                    width: "18%",
                    aspectRatio: 1,
                    borderRadius: "50%",
                    backgroundColor: color,
                    borderWidth: color === bgColor ? 2 : 1,
                    borderColor: color === bgColor ? "black" : "#ddd",
                  }}
                />
              ))}
            </View>
            <TouchableOpacity
              style={{
                paddingHorizontal: 24,
                paddingVertical: 6,
                alignSelf: "center",
                backgroundColor: "#797979",
                borderRadius: 8,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text adjustsFontSizeToFit style={{ color: "#fff" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default NotificatinoButton;
