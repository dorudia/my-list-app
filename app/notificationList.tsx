import { useNotifications } from "@/store/notification-context";
import { useTodos } from "@/store/todo-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { use, useEffect, useLayoutEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const NotificationList = () => {
  const { bgColor } = useTodos();
  const [color, setColor] = useState("#fff");
  const navigation = useNavigation();
  const {
    notifications,
    removeNotification,
    clearNotifications,
    markAllAsRead,
  } = useNotifications();
  const delivered = notifications.filter((n) => n.delivered);

  useEffect(() => {
    setColor(bgColor);
    console.log(color);
  }, [bgColor]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: bgColor,
      },
      contentStyle: {
        backgroundColor: bgColor,
      },
    });
  });

  useEffect(() => {
    if (notifications.length === 0) return;

    const timer = setTimeout(() => {
      markAllAsRead(); // funcția din context
    }, 2300);

    return () => clearTimeout(timer); // curățare la demontare
  }, [notifications]);

  useEffect(() => {
    return () => {
      markAllAsRead();
    };
  }, []);

  return (
    <ScrollView scrollEnabled={true} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ultimele notificări:</Text>
      {notifications.map((n) => (
        <View key={n.id} style={styles.notification}>
          <Ionicons name="notifications-outline" size={16} color="#1e33d0" />
          <Text
            numberOfLines={1}
            style={[
              styles.notificationText,
              { color: n.read ? "#747474" : "#314797" },
            ]}
          >
            {n?.title} — {new Date(n?.date!).toLocaleTimeString()}
          </Text>
          {/* <Button title="X" onPress={() => removeNotification(n.id)} /> */}
          <TouchableOpacity onPress={() => removeNotification(n.id)}>
            <Ionicons name="close" size={28} color="#e13131" />
          </TouchableOpacity>
        </View>
      ))}
      {notifications.length === 0 && (
        <Text style={styles.notificationText}>Nu ai notificări</Text>
      )}
      {notifications.length > 0 && (
        <View>
          <TouchableOpacity
            style={styles.delteAll}
            onPress={clearNotifications}
          >
            <Text style={styles.deleteAllText}>Șterge toate</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default NotificationList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginBottom: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  notificationText: {
    flex: 1,
    color: "#555",
    marginRight: 10,
    marginLeft: 4,
  },
  delteAll: {
    backgroundColor: "#dd3535",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 16,
  },
  deleteAllText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
