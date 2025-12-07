import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useUser } from "@clerk/clerk-expo";
import { useTodos } from "@/store/todo-context";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
import { useAuth } from "@clerk/clerk-react";

const API_URL = process.env.REACT_APP_API_URL || "http://192.168.0.216:3000";
// const API_URL = "https://my-list-app-server.onrender.com";

export type NotificationItem = {
  _id: string;
  userId: string;
  todoId?: string;
  listName?: string;
  title: string;
  body?: string;
  read: boolean;
  delivered: boolean;
  date?: string;
  expoPushToken?: string;
};

type PendingNotification = {
  todoId: string;
  listName: string;
  updates: Partial<NotificationItem>;
};

type NotificationContextType = {
  notifications: NotificationItem[];
  fetchNotifications: (userId?: string) => Promise<void>;
  createNotification: (
    data: Partial<NotificationItem>,
    userId?: string
  ) => Promise<void>;
  updateNotification: (
    id: string,
    data: Partial<NotificationItem>,
    userId?: string
  ) => Promise<void>;
  deleteNotification: (userId: string, id: string) => Promise<void>;
  deleteAllNotifications: (userId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  fetchNotifications: async () => {},
  createNotification: async () => {},
  updateNotification: async () => {},
  deleteNotification: async () => {},
  deleteAllNotifications: async () => {},
  markAllAsRead: async () => {},
});

export const NotificationProvider = ({
  token,
  children,
}: {
  token: () => Promise<string | null>;
  children: React.ReactNode;
}) => {
  const { user, isLoaded } = useUser();
  // const { getToken } = useAuth();
  const { updateTodo } = useTodos();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationsRef = useRef<NotificationItem[]>([]);
  notificationsRef.current = notifications;
  const [pendingNotifications, setPendingNotifications] = useState<
    PendingNotification[]
  >([]);
  notificationsRef.current = notifications;
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Fetch all notifications
  const fetchNotifications = async (userId?: string) => {
    if (!isLoaded || !user) return;
    const id = userId || user.id;
    const clerkToken = await token();

    try {
      const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
      });
      const data: NotificationItem[] = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Create a notification
  const createNotification = async (
    data: Partial<NotificationItem>,
    userId?: string
  ) => {
    if (!isLoaded || !user) return;
    const id = userId || user.id;
    const clerkToken = await token();

    // Obține email-ul utilizatorului din Clerk
    const userEmail = user.primaryEmailAddress?.emailAddress;

    console.log("👤 User email from Clerk:", userEmail);
    console.log("👤 Full user object:", user);

    const payload = {
      ...data,
      userId: id,
      expoPushToken,
      userEmail, // Adăugăm email-ul pentru reminder prin email
    };

    console.log("📤 Sending notification payload:", payload);

    try {
      await fetch(`${API_URL}/notifications/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(payload),
      });
      await fetchNotifications(id);
    } catch (err) {
      console.error("Error creating notification:", err);
    }
  };

  // Update a notification
  const updateNotification = async (
    idNotif: string,
    data: Partial<NotificationItem>,
    userId?: string
  ) => {
    if (!isLoaded || !user) return;
    const id = userId || user.id;
    const clerkToken = await token();
    try {
      await fetch(`${API_URL}/notifications/${id}/${idNotif}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(data),
      });
      await fetchNotifications(id);
    } catch (err) {
      console.error("Error updating notification:", err);
    }
  };

  // Delete a single notification
  const deleteNotification = async (userId: string, idNotif: string) => {
    if (!isLoaded || !user) return;
    const clerkToken = await token();
    try {
      await fetch(`${API_URL}/notifications/${userId}/${idNotif}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
      });
      await fetchNotifications(userId);
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async (userId: string) => {
    if (!isLoaded || !user) return;
    const clerkToken = await token();
    try {
      await fetch(`${API_URL}/notifications/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
      });
      setNotifications([]);
    } catch (err) {
      console.error("Error deleting all notifications:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (userId: string) => {
    if (!user) return;

    try {
      // 1️⃣ actualizare instant UI
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      // 2️⃣ update async la server, nu blocăm UI-ul
      const unread = notifications.filter((n) => !n.read);
      for (const n of unread) {
        updateNotification(n._id, { read: true }, userId).catch((err) => {
          console.error("Error updating notification on server:", err);
        });
      }
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  // 🔹 Permisiuni și Expo Push Token
  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (Platform.OS === "web") {
        if ("Notification" in window) {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;
        }
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(tokenData.data);
      // console.log("✅ Expo Push Token:", tokenData.data);
    };

    if (isLoaded && user) {
      registerForPushNotifications();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(async (notification) => {
        console.log("🔔 Notificare primită");
        const data = notification.request.content.data as {
          todoId: string;
          listName: string;
          title: string;
        };
        // console.log("✅ data:", { data });

        const { todoId, listName, title } = data;
        // console.log("Listener a primit data", { todoId, listName, title });

        if (!isLoaded || !user) {
          setPendingNotifications((prev: PendingNotification[]) => [
            ...prev,
            {
              todoId,
              listName,
              updates: { title, reminder: false, reminderDate: null },
            },
          ]);
          return;
        }

        try {
          // console.log("✅ Din listener:", todoId, listName);

          await updateTodo({
            _id: todoId, // ⚠ folosește _id conform BE
            listName,
            reminder: false,
            reminderDate: null,
          });

          // ⚠ marchează notificarea ca delivered dacă vrei
          await updateNotification(todoId, { delivered: true });

          await fetchNotifications();
        } catch (err) {
          console.log("❌ Error processing notification:", err);
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // console.log("👉 User a interacționat cu notificarea:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isLoaded, user]);

  // Check missed notifications
  // Check missed notifications simplificat
  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkMissedNotifications = async () => {
      // 1️⃣ Fetch notificările actuale
      await fetchNotifications(user.id);

      // 2️⃣ Luăm doar notificările care nu sunt livrate și au trecut
      const now = new Date();
      const missed = notificationsRef.current.filter((n) => {
        if (!n.date || n.delivered) return false;
        return new Date(n.date) < now;
      });

      // console.log("🔔 Missed notifications:", missed);

      // 3️⃣ Procesăm fiecare notificare pe rând
      for (const n of missed) {
        if (!n.listName || !n.todoId) {
          console.warn("⚠️ Missing listName or todoId for notification", n._id);
          continue;
        }

        // Dezactivăm reminder-ul în TODO
        await updateTodo({
          _id: n.todoId,
          listName: n.listName,
          reminder: false,
          reminderDate: null,
        });

        // Marcam notificarea ca livrată
        await updateNotification(n._id, { delivered: true });
      }

      // 4️⃣ Re-fetch notificările după update
      await fetchNotifications(user.id);
    };

    checkMissedNotifications();
  }, [isLoaded, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        fetchNotifications,
        createNotification,
        updateNotification,
        deleteNotification,
        deleteAllNotifications,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
