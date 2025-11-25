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
import { useUser } from "@clerk/clerk-expo";
import { useNotifications } from "@/store/notification-context";

const NotificationList = () => {
  const { bgColor } = useTodos();
  const navigation = useNavigation();
  const { user, isLoaded } = useUser();

  const {
    notifications,
    deleteNotification,
    deleteAllNotifications,
    markAllAsRead,
  } = useNotifications();

  // Filtrăm doar notificările livrate
  const deliveredNotifications = notifications.filter((n) => n.delivered);

  // Setăm stilul headerului
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: bgColor },
      contentStyle: { backgroundColor: bgColor },
    });
  }, [navigation, bgColor]);

  // Marchează toate ca citite după ce se încarcă notificările livrate
  useEffect(() => {
    if (isLoaded && user && deliveredNotifications.length > 0) {
      const timer = setTimeout(() => {
        markAllAsRead(user.id);
      }, 2300);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, user, deliveredNotifications]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    return () => {
      markAllAsRead(user.id); // aici e SIGUR executat
    };
  }, [isLoaded, user]);

  if (!isLoaded || !user) return null;

  return (
    <ScrollView scrollEnabled contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ultimele notificări:</Text>

      {deliveredNotifications.length === 0 && (
        <Text style={styles.notificationText}>Nu ai notificări</Text>
      )}

      {deliveredNotifications.map((n) => (
        <View key={n._id} style={styles.notification}>
          <Ionicons name="notifications-outline" size={16} color="#1e33d0" />
          <Text
            numberOfLines={1}
            style={[
              styles.notificationText,
              { color: n.read ? "#747474" : "#314797" },
            ]}
          >
            {n?.title} — {n.date ? new Date(n.date).toLocaleTimeString() : ""}
          </Text>
          <TouchableOpacity onPress={() => deleteNotification(user.id, n._id)}>
            <Ionicons name="close" size={28} color="#e13131" />
          </TouchableOpacity>
        </View>
      ))}

      {deliveredNotifications.length > 0 && (
        <View>
          <TouchableOpacity
            style={styles.deleteAll}
            onPress={() => deleteAllNotifications(user.id)}
          >
            <Text style={styles.deleteAllText}>Șterge toate</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  notificationText: {
    marginLeft: 8,
    flex: 1,
  },
  deleteAll: {
    marginTop: 16,
    backgroundColor: "#e13131",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteAllText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default NotificationList;
