import { useTodos } from "@/store/todo-context";
import { useUser } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  delivered: boolean;
  todoId: string;
  listName: string;
  expoPushToken?: string | null;
  date?: Date;
  notificationId?: string;
};

type NotificationContextType = {
  notifications: NotificationItem[];
  expoPushToken: string | null;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
  updateNotification: (id: string, data: Partial<NotificationItem>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  createNotification: (data: Partial<NotificationItem>) => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  expoPushToken: null,
  markAllAsRead: () => {},
  fetchNotifications: () => {},
  updateNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
  createNotification: () => {},
});

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const { updateTodo, fetchTodos } = useTodos();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationsRef = useRef<NotificationItem[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<
    { todoId: string; listName: string; updates: Partial<NotificationItem> }[]
  >([]);
  notificationsRef.current = notifications;
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const getUserUri = async () => {
    if (!isLoaded || !user) return null;
    return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/notifications-${user.id}`;
  };

  const fetchNotifications = async () => {
    const userUri = await getUserUri();
    if (!userUri) return;

    try {
      const res = await fetch(`${userUri}.json`);
      const data = await res.json();
      if (data) {
        const loaded = Object.entries(data).map(([key, value]: any) => ({
          ...value,
          id: key,
          date: new Date(value.date),
        }));
        setNotifications(loaded.reverse());
      }
    } catch (e) {
      console.warn("❌ Eroare la fetchNotifications:", e);
    }
  };

  const updateNotification = async (
    id: string,
    data: Partial<NotificationItem>
  ) => {
    const userUri = await getUserUri();
    if (!userUri) return;
    await fetch(`${userUri}/${id}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, expoPushTokenKey: expoPushToken }),
    });
  };

  const createNotification = async (data: Partial<NotificationItem>) => {
    console.log("createNotification apelat");
    const userUri = await getUserUri();
    const id = Date.now().toString();
    if (!userUri) return;
    const res = await fetch(`${userUri}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, expoPushTokenKey: expoPushToken }),
    });
    const dataRes = await res.json();
    const notificationId = dataRes.name;

    await updateNotification(notificationId, { notificationId });
  };

  const removeNotification = async (id: string) => {
    const userUri = await getUserUri();
    if (!userUri) return;

    await fetch(`${userUri}/${id}.json`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = async () => {
    const userUri = await getUserUri();
    if (!userUri) return;

    await fetch(`${userUri}.json`, { method: "DELETE" });
    setNotifications([]);
  };

  const markAllAsRead = async () => {
    const userUri = await getUserUri();
    if (!userUri) return;

    for (const n of notifications) {
      if (!n.read) {
        await updateNotification(n.id, { read: true });
      }
    }

    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // când user-ul e gata, procesăm notificările rămase
  useEffect(() => {
    // când user-ul e gata, procesăm notificările rămase
    if (isLoaded && pendingNotifications.length > 0) {
      console.log("✅Pending notifications:", pendingNotifications);
      pendingNotifications.forEach((notif) => {
        updateTodo({
          id: notif.todoId,
          listName: notif.listName,
          ...notif.updates,
        });
      });
      setPendingNotifications([]);
    }
  }, [isLoaded, user, pendingNotifications]);

  // 🔹 Permisiuni și Expo Push Token
  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (Platform.OS === "web") return;

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("❌ Permisiuni pentru notificări refuzate");
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(tokenData.data);
      console.log("✅ Expo Push Token:", tokenData.data);
    };

    registerForPushNotifications();
  }, [isLoaded, user]);

  // 🔹 Listener pentru toate notificările primite (foreground & push) v2
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(async (notification) => {
        console.log("🔔 Notificare primită:", notification);
        const data = notification.request.content.data as {
          todoId: string;
          listName: string;
          title: string;
          completed: boolean;
        };
        const todoId = data.todoId;
        const listName = data.listName;
        const title = data.title;

        if (!isLoaded || !user) {
          console.log("❌ Nu putem procesa notificarea, user-ul nu este gata");
          setPendingNotifications((prev) => [
            ...prev,
            {
              todoId,
              listName,
              updates: { title, reminder: false, reminderDate: null },
            },
          ]);
          console.log("pendingNotifications added:", pendingNotifications);
          return;
        }

        try {
          console.log("🎯 updateTodo apelat cu:", { todoId, listName, title });

          await updateTodo({
            id: todoId,
            listName,
            reminder: false,
            reminderDate: null,
          });

          await fetchNotifications();
        } catch (err) {
          console.log("❌ Error processing notification:", err);
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👉 User a interacționat cu notificarea:", response);
      });

    return () => {
      // ✅ în versiunile noi trebuie apelată metoda `.remove()`
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
  // 🔹 Verifică notificările ratate la pornire
  useEffect(() => {
    const checkMissedNotifications = async () => {
      const now = new Date();
      const missed = notificationsRef.current.filter(
        (n) => !n.delivered && n.date && n.date < now
      );

      for (const n of missed) {
        await updateTodo({
          id: n.todoId,
          listName: n.listName,
          text: n.title,
          reminder: false,
          reminderDate: null,
        });
        await updateNotification(n.id, { delivered: true });
      }

      fetchNotifications();
    };

    checkMissedNotifications();
  }, [isLoaded, user]);

  useEffect(() => {
    const fetchNotificationsOnLoad = async () => {
      await fetchNotifications();
    };
    fetchNotificationsOnLoad();
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        expoPushToken,
        markAllAsRead,
        fetchNotifications,
        updateNotification,
        removeNotification,
        clearNotifications,
        createNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
export default NotificationProvider;
