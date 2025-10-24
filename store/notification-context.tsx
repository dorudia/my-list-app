// ----------------------------------------cu AsyncStorage ⬇️ -------------------------

// import { useUser } from "@clerk/clerk-expo";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { createContext, useContext, useEffect, useState } from "react";
// import { Alert, Platform } from "react-native";

// // 🌟 Tipul unei notificări stocate local
// type NotificationItem = {
//   id: string;
//   title: string;
//   body: string;
//   date: Date;
//   read: boolean;
//   delivered: boolean; // pentru a marca notificările care au fost livrate
// };

// // 🌟 Tipul contextului notificărilor
// type NotificationContextType = {
//   notifications: NotificationItem[];
//   scheduleNotification: (title: string, date: Date) => void;
//   removeNotification: (id: string) => void;
//   clearNotifications: () => void;
//   markAllAsRead: () => void;
// };

// const STORAGE_KEY = "@notifications";

// export const NotificationContext = createContext<NotificationContextType>({
//   notifications: [],
//   scheduleNotification: () => {},
//   removeNotification: () => {},
//   clearNotifications: () => {},
//   markAllAsRead: () => {},
// });

// const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const { user, isLoaded } = useUser();

//   const getUserUri = async () => {
//     // ia user-ul curent din Clerk
//     if (!isLoaded || !user) return null;

//     const userId = user.id; // Clerk generează un ID unic pentru fiecare utilizator
//     return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/notifications-${userId}`;
//   };

//   // 🔹 Încarcă notificările salvate și marchează livrate cele trecute
//   const loadAndUpdateNotifications = async () => {
//     try {
//       const stored = await AsyncStorage.getItem(STORAGE_KEY);
//       if (!stored) return;

//       const notificationsStored: NotificationItem[] = JSON.parse(stored);
//       console.log(
//         "din loadAndUpdateNotifications:",
//         "notificationsStored:",
//         notificationsStored
//       );

//       const now = new Date().getTime(); // UTC

//       // marcam ca livrate notificările care au trecut
//       const updated = notificationsStored.map((n) => {
//         const notifDate = new Date(n.date).getTime();
//         if (notifDate <= now && !n.delivered) {
//           return { ...n, delivered: true };
//         }
//         return n;
//       });

//       // salvăm modificările în AsyncStorage
//       await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

//       // 🔹 actualizăm UI-ul cu notificările livrate
//       setNotifications(updated.filter((n) => n.delivered));
//     } catch (e) {
//       console.warn("Failed to load/update notifications:", e);
//     }
//   };

//   useEffect(() => {
//     loadAndUpdateNotifications();
//   }, []);

//   // 🔹 Cerem permisiuni pentru notificări la primul render
//   useEffect(() => {
//     const registerNotifications = async () => {
//       if (Platform.OS === "web") return;

//       try {
//         const Notifications = await import("expo-notifications");
//         const { status: existingStatus } =
//           await Notifications.getPermissionsAsync();
//         let finalStatus = existingStatus;

//         if (existingStatus !== "granted") {
//           const { status } = await Notifications.requestPermissionsAsync();
//           finalStatus = status;
//         }

//         if (finalStatus !== "granted") {
//           Alert.alert("Nu s-au acordat permisiuni pentru notificări!");
//         }
//       } catch (e) {
//         console.warn("Expo Notifications nu este disponibil:", e);
//       }
//     };

//     registerNotifications();
//   }, []);

//   // 🔹 Listener pentru foreground
// useEffect(() => {
//   if (Platform.OS === "web") return;

//   const setupListener = async () => {
//     const Notifications = await import("expo-notifications");
//     const subscription = Notifications.addNotificationReceivedListener(
//       (notification) => {
//         setNotifications((prev) => [
//           {
//             id: notification.request.identifier,
//             title: notification.request.content.title || "Todo Reminder",
//             body: notification.request.content.body || "",
//             date: new Date(),
//             read: false,
//             delivered: true,
//           },
//           ...prev,
//         ]);
//       }
//     );

//     return () => subscription.remove();
//   };

//   setupListener();
// }, []);

//   const scheduleNotification = async (title: string, date: Date) => {
//     console.log("🕓 [scheduleNotification] start:", { title, date });

//     if (Platform.OS === "web") {
//       return;
//     }

//     try {
//       const Notifications = await import("expo-notifications");

//       // verificăm permisiunile
//       const { status } = await Notifications.getPermissionsAsync();
//       if (status !== "granted") {
//         const { status: newStatus } =
//           await Notifications.requestPermissionsAsync();
//         if (newStatus !== "granted") {
//           return;
//         }
//       }
//       // programăm notificarea

//       const notificationId = await Notifications.scheduleNotificationAsync({
//         content: {
//           title: "My List Reminder",
//           body: title,
//           sound: "default",
//         },
//         trigger: {
//           type: "date",
//           date,
//         } as any,
//       });

//       console.log("✅ Notification scheduled with ID:", notificationId);

//       // pregătim noul obiect
//       const newNotification = {
//         id: notificationId || String(Date.now()),
//         title,
//         body: title,
//         date,
//         read: false,
//         delivered: false,
//       };

//       // citim ce avem deja în AsyncStorage
//       const existing = await AsyncStorage.getItem("@notifications");

//       const current = existing ? JSON.parse(existing) : [];
//       const updated = [newNotification, ...current];
//       console.log("➡ updated:", updated);

//       // salvăm în AsyncStorage
//       await AsyncStorage.setItem("@notifications", JSON.stringify(updated));
//       const storeUpdated = await AsyncStorage.getItem("@notifications");

//       console.log("✅ Notification saved to AsyncStorage:", storeUpdated);

//       // actualizăm și state-ul local (pentru refresh imediat)
//       setNotifications((prev) => [...prev, newNotification]);
//     } catch (error) {
//       console.log("Error scheduling notification:", error);
//     }
//   };

//   const markAllAsRead = async () => {
//     setNotifications((prev) => {
//       const updated = prev.map((n) => ({ ...n, read: true }));
//       AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
//       return updated;
//     });
//   };

//   const removeNotification = (id: string) => {
//     setNotifications((prev) => prev.filter((n) => n.id !== id));
//   };

//   const clearNotifications = () => {
//     setNotifications([]);
//   };

//   const value = {
//     notifications,
//     scheduleNotification,
//     removeNotification,
//     clearNotifications,
//     markAllAsRead,
//   };

//   return (
//     <NotificationContext.Provider value={value}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);

// export default NotificationProvider;

// -------------------- ⬇️. Cu Firebase.  ⬇️--------------------

import { useTodos } from "@/store/todo-context";
import { useUser } from "@clerk/clerk-expo";
// import * as Notifications from "expo-notifications";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

// 🌟 Tipul unei notificări
type NotificationItem = {
  id: string;
  title: string;
  body: string;
  date: Date;
  read: boolean;
  delivered: boolean;
  todoId: string;
  listName: string;
};

// 🌟 Tipul contextului
type NotificationContextType = {
  notifications: NotificationItem[];
  scheduleNotification: (
    id: string,
    title: string,
    date: Date,
    listName: string
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
  updateNotification: (notificationId: string, data: NotificationItem) => void;
};

// 🌟 Contextul
export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  scheduleNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
  markAllAsRead: () => {},
  fetchNotifications: () => {},
  updateNotification: () => {},
});

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { user, isLoaded } = useUser();
  const { todos, updateTodo, fetchTodos, addTodo } = useTodos();
  const notificationsRef = useRef<NotificationItem[]>([]);
  notificationsRef.current = notifications;

  const getUserUri = async () => {
    if (!isLoaded || !user) return null;
    const userId = user.id;
    return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/notifications-${userId}`;
  };

  const fetchNotifications = async () => {
    const userUri = await getUserUri();
    if (!userUri) return;

    try {
      const res = await fetch(`${userUri}.json`);
      const data = await res.json();
      if (data) {
        const loaded = Object.entries(data).map(([key, value]: any) => ({
          ...value, // ia toate câmpurile
          id: key, // suprascrie sau setează id-ul cu key-ul Firebase
          date: new Date(value.date),
        }));

        setNotifications(loaded.reverse());
      }
    } catch (e) {
      console.warn("❌ Eroare la încărcarea notificărilor:", e);
    }
  };

  // 🔹 Încarcă notificările din Firebase
  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchNotifications();
  }, [isLoaded, user]);

  // 🔹 Verifică permisiunile pentru notificări
  useEffect(() => {
    const checkPermissionsAndListener = async () => {
      if (Platform.OS === "web") return;

      try {
        const { status } = await Notifications.getPermissionsAsync();
        console.log("🎯 [Startup] Existing notification status:", status);

        if (status !== "granted") {
          const { status: newStatus } =
            await Notifications.requestPermissionsAsync();
          console.log("🎯 [Startup] Requested notification status:", newStatus);
        } else {
          console.log("✅ [Startup] Permisiuni pentru notificări OK");
        }

        // Listener foreground
        const subscription = Notifications.addNotificationReceivedListener(
          (notification) => {
            console.log(
              "📬 [Listener] Notification received:",
              notification.request.content
            );
          }
        );

        return () => subscription.remove();
      } catch (e) {
        console.warn(
          "❌ [Startup] Error checking permissions or setting listener:",
          e
        );
      }
    };

    checkPermissionsAndListener();
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        // shouldShowAlert: true,
        shouldShowBanner: true, // nou
        shouldShowList: true, // nou
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log("📬 Notification received:", notification.request.content);

        const todoId = notification.request.content.data?.todoId as string;
        const listName = notification.request.content.data?.listName as string;
        const text = notification.request.content.data?.text as string;
        const notificationId = notification.request.content.data
          ?.firebaseId as string;
        console.log("🎯NotificationListener:", { todoId, listName, text });

        if (!todoId) return;

        console.log("ajunge la updateTodo");

        try {
          console.log("🚀 Apelez updateTodo cu:", { todoId, listName, text });
          await updateTodo({
            id: todoId,
            listName,
            text,
            reminder: false,
            reminderDate: null,
          });
          await updateNotification(notificationId, { delivered: true });
          fetchNotifications();
          console.log("🏁 updateTodo a fost apelat fără erori");
        } catch (error) {
          console.log("updateTodo nu se apeleaza:", error);
        }

        // await updateNotification();

        console.log(`✅ Reminder reset for todo: ${text}`);
      }
    );

    return () => subscription.remove(); // cleanup la demontare
  }, [todos, updateTodo]);

  const scheduleNotification = async (
    id: string,
    title: string,
    date: Date,
    listName: string
  ) => {
    const generatedId =
      new Date().getTime().toString() + Math.random().toString();
    console.log("🕓 [scheduleNotification] start:", {
      id,
      title,
      date,
      generatedId,
    });

    if (Platform.OS === "web") return;

    // Corectăm ora locală
    const now = new Date();
    // if (date.getTime() <= now.getTime()) {
    //   console.warn("❌ Data notificării este în trecut, ajustez la +1 minut");
    //   date = new Date(now.getTime() + 60 * 1000); // +1 minut
    // }

    try {
      const newNotification: Omit<NotificationItem, "id"> = {
        title,
        body: title,
        date,
        read: false,
        delivered: false,
        todoId: id,
        listName: listName,
      };

      const userUri = await getUserUri();
      if (!userUri) return;

      const res = await fetch(`${userUri}.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotification),
      });

      const data = await res.json();
      const firebaseId = data.name;
      console.log("firebaseId:", firebaseId);

      setNotifications((prev) => [
        { ...newNotification, id: firebaseId },
        ...prev,
      ]);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder",
          body: title,
          sound: "default",
          data: { todoId: id, listName: listName, text: title, firebaseId },
        },
        trigger: { type: "date", date } as any,
      });

      console.log("✅ Notification scheduled on device:", notificationId);

      console.log("✅ Notification saved in Firebase:", firebaseId);

      // updateTodo(firebaseId, "default", title, false, true, date);
    } catch (error) {
      console.log("❌ Error scheduling notification:", error);
    }
  };

  // 🔹 Marchează toate ca citite
  const markAllAsRead = async () => {
    const userUri = await getUserUri();
    if (!userUri) return;

    try {
      const updated: NotificationItem[] = [];

      for (const n of notifications) {
        if (!n.read) {
          // update în Firebase
          await fetch(`${userUri}/${n.id}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          });
        }
        // update local
        updated.push({ ...n, read: true });
      }

      setNotifications(updated);
    } catch (e) {
      console.warn("❌ Eroare la markAllAsRead:", e);
    }
  };

  // 🔹 Șterge o notificare
  const removeNotification = async (id: string) => {
    const userUri = await getUserUri();
    if (!userUri) return;

    try {
      await fetch(`${userUri}/${id}.json`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.warn("❌ Eroare la ștergere notificare:", e);
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
      body: JSON.stringify({ ...data }),
    });
  };
  // 🔹 Golește toate notificările
  const clearNotifications = async () => {
    const userUri = await getUserUri();
    if (!userUri) return;

    try {
      await fetch(`${userUri}.json`, { method: "DELETE" });
      setNotifications([]);
    } catch (e) {
      console.warn("❌ Eroare la ștergerea tuturor notificărilor:", e);
    }
  };

  const value = {
    notifications,
    scheduleNotification,
    removeNotification,
    clearNotifications,
    markAllAsRead,
    fetchNotifications,
    updateNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
export default NotificationProvider;
