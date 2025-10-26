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
//   useEffect(() => {
//     if (Platform.OS === "web") return;

//     const setupListener = async () => {
//       const Notifications = await import("expo-notifications");
//       const subscription = Notifications.addNotificationReceivedListener(
//         (notification) => {
//           setNotifications((prev) => [
//             {
//               id: notification.request.identifier,
//               title: notification.request.content.title || "Todo Reminder",
//               body: notification.request.content.body || "",
//               date: new Date(),
//               read: false,
//               delivered: true,
//             },
//             ...prev,
//           ]);
//         }
//       );

//       return () => subscription.remove();
//     };

//     setupListener();
//   }, []);

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

// import { useTodos } from "@/store/todo-context";
// import { useUser } from "@clerk/clerk-expo";
// import * as Notifications from "expo-notifications";
// import { createContext, useContext, useEffect, useRef, useState } from "react";
// import { Platform } from "react-native";

// type NotificationItem = {
//   id: string;
//   title: string;
//   body: string;
//   date: Date;
//   read: boolean;
//   delivered: boolean;
//   todoId: string;
//   listName: string;
// };

// type NotificationContextType = {
//   notifications: NotificationItem[];
//   scheduleNotification: (
//     id: string,
//     title: string,
//     date: Date,
//     listName: string
//   ) => void;
//   removeNotification: (id: string) => void;
//   clearNotifications: () => void;
//   markAllAsRead: () => void;
//   fetchNotifications: () => void;
//   updateNotification: (id: string, data: Partial<NotificationItem>) => void;
// };

// export const NotificationContext = createContext<NotificationContextType>({
//   notifications: [],
//   scheduleNotification: () => {},
//   removeNotification: () => {},
//   clearNotifications: () => {},
//   markAllAsRead: () => {},
//   fetchNotifications: () => {},
//   updateNotification: () => {},
// });

// const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const { user, isLoaded } = useUser();
//   const { updateTodo } = useTodos();
//   const notificationsRef = useRef<NotificationItem[]>([]);
//   notificationsRef.current = notifications;

//   const getUserUri = async () => {
//     if (!isLoaded || !user) return null;
//     return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/notifications-${user.id}`;
//   };

//   const fetchNotifications = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;

//     try {
//       const res = await fetch(`${userUri}.json`);
//       const data = await res.json();
//       if (!data) {
//         setNotifications([]);
//         return;
//       }

//       const loaded = Object.entries(data).map(([key, value]: any) => ({
//         ...value,
//         id: key,
//         date: new Date(value.date),
//       }));

//       setNotifications(loaded.reverse());
//     } catch (e) {
//       console.warn("❌ Eroare la încărcarea notificărilor:", e);
//     }
//   };

//   const updateNotification = async (
//     id: string,
//     data: Partial<NotificationItem>
//   ) => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     await fetch(`${userUri}/${id}.json`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//   };

//   // 🔹 La pornire: verific notificările ratate și le aplic
//   // useEffect(() => {
//   //   if (!isLoaded || !user) return;

//   //   const checkMissedNotifications = async () => {
//   //     await fetchNotifications();
//   //     const now = new Date();

//   //     const missed = notificationsRef.current.filter(
//   //       (n) => !n.delivered && n.date < now
//   //     );

//   //     for (const n of missed) {
//   //       try {
//   //         await updateTodo({
//   //           id: n.todoId,
//   //           listName: n.listName,
//   //           text: n.title,
//   //           reminder: false,
//   //           reminderDate: null,
//   //         });
//   //         await updateNotification(n.id, { delivered: true });
//   //       } catch (err) {
//   //         console.warn("❌ Eroare la notificarea ratată:", n.id, err);
//   //       }
//   //     }

//   //     await fetchNotifications();
//   //   };

//   //   checkMissedNotifications();
//   // }, [isLoaded, user]);

//   useEffect(() => {
//     if (!isLoaded || !user) return;

//     const checkMissedNotifications = async () => {
//       // 1️⃣ Încarcă notificările
//       await fetchNotifications();

//       // 2️⃣ Folosește notificationsRef după ce s-au setat
//       const now = new Date();
//       const missed = notificationsRef.current.filter(
//         (n) => !n.delivered && n.date < now
//       );

//       if (missed.length === 0) {
//         console.log("✅ Nicio notificare ratată.");
//         return;
//       }

//       console.log(`⚠️ Găsite ${missed.length} notificări ratate.`);

//       for (const n of missed) {
//         try {
//           await updateTodo({
//             id: n.todoId,
//             listName: n.listName,
//             text: n.title,
//             reminder: false,
//             reminderDate: null,
//           });
//           await updateNotification(n.id, { delivered: true });
//         } catch (err) {
//           console.warn("❌ Eroare la notificarea ratată:", n.id, err);
//         }
//       }

//       // 3️⃣ Reîncarcă lista după update
//       await fetchNotifications();
//     };

//     checkMissedNotifications();
//   }, [isLoaded, user]);

//   // 🔹 Permisiuni + handler notificări foreground
//   useEffect(() => {
//     if (Platform.OS === "web") return;

//     const setupNotifications = async () => {
//       const { status } = await Notifications.getPermissionsAsync();
//       if (status !== "granted") {
//         await Notifications.requestPermissionsAsync();
//       }

//       Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowBanner: true,
//           shouldShowList: true,
//           shouldPlaySound: true,
//           shouldSetBadge: false,
//         }),
//       });

//       const sub = Notifications.addNotificationReceivedListener(
//         async (notification) => {
//           const todoId = notification.request.content.data?.todoId as string;
//           const listName = notification.request.content.data
//             ?.listName as string;
//           const text = notification.request.content.data?.text as string;
//           const notificationId = notification.request.content.data
//             ?.firebaseId as string;

//           if (!todoId) return;

//           try {
//             await updateTodo({
//               id: todoId,
//               listName,
//               text,
//               reminder: false,
//               reminderDate: null,
//             });
//             await updateNotification(notificationId, { delivered: true });
//             await fetchNotifications();
//           } catch (err) {
//             console.warn("❌ Eroare la listener notificare:", err);
//           }
//         }
//       );

//       return () => sub.remove();
//     };

//     setupNotifications();
//   }, [updateTodo]);

//   const scheduleNotification = async (
//     id: string,
//     title: string,
//     date: Date,
//     listName: string
//   ) => {
//     if (Platform.OS === "web") return;

//     const newNotification: Omit<NotificationItem, "id"> = {
//       title,
//       body: title,
//       date,
//       read: false,
//       delivered: false,
//       todoId: id,
//       listName,
//     };

//     const userUri = await getUserUri();
//     if (!userUri) return;

//     const res = await fetch(`${userUri}.json`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newNotification),
//     });
//     const firebaseId = (await res.json()).name;

//     setNotifications((prev) => [
//       { ...newNotification, id: firebaseId },
//       ...prev,
//     ]);

//     await Notifications.scheduleNotificationAsync({
//       identifier: `${firebaseId}-${Date.now()}`, // ID unic
//       content: {
//         title: "Reminder",
//         body: title,
//         sound: "default",
//         data: { todoId: id, listName, text: title, firebaseId },
//       },
//       trigger: { type: "date", date } as any,
//     });
//   };

//   const markAllAsRead = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;

//     for (const n of notifications) {
//       if (!n.read) {
//         await updateNotification(n.id, { read: true });
//       }
//     }

//     setNotifications(notifications.map((n) => ({ ...n, read: true })));
//   };

//   const removeNotification = async (id: string) => {
//     const userUri = await getUserUri();
//     if (!userUri) return;

//     await fetch(`${userUri}/${id}.json`, { method: "DELETE" });
//     setNotifications((prev) => prev.filter((n) => n.id !== id));
//   };

//   const clearNotifications = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;

//     await fetch(`${userUri}.json`, { method: "DELETE" });
//     setNotifications([]);
//   };

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         scheduleNotification,
//         removeNotification,
//         clearNotifications,
//         markAllAsRead,
//         fetchNotifications,
//         updateNotification,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);
// export default NotificationProvider;

// -------------------- ⬇️ Cu Firebase. last  ⬇️--------------------

// import { useTodos } from "@/store/todo-context";
// import { useUser } from "@clerk/clerk-expo";
// import * as Notifications from "expo-notifications";
// import { createContext, useContext, useEffect, useRef, useState } from "react";
// import { Platform } from "react-native";

// // 🌟 Tipul unei notificări
// type NotificationItem = {
//   id: string;
//   title: string;
//   body: string;
//   date: Date;
//   read: boolean;
//   delivered: boolean;
//   todoId: string;
//   listName: string;
// };

// // 🌟 Tipul contextului
// type NotificationContextType = {
//   notifications: NotificationItem[];
//   scheduleNotification: (
//     id: string,
//     title: string,
//     date: Date,
//     listName: string
//   ) => void;
//   removeNotification: (id: string) => void;
//   clearNotifications: () => void;
//   markAllAsRead: () => void;
//   fetchNotifications: () => void;
//   updateNotification: (notificationId: string, data: NotificationItem) => void;
// };

// // 🌟 Contextul
// export const NotificationContext = createContext<NotificationContextType>({
//   notifications: [],
//   scheduleNotification: () => {},
//   removeNotification: () => {},
//   clearNotifications: () => {},
//   markAllAsRead: () => {},
//   fetchNotifications: () => {},
//   updateNotification: () => {},
// });

// const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const { user, isLoaded } = useUser();
//   const { todos, updateTodo, fetchTodos, addTodo } = useTodos();
//   const notificationsRef = useRef<NotificationItem[]>([]);
//   notificationsRef.current = notifications;

//   const getUserUri = async () => {
//     if (!isLoaded || !user) return null;
//     const userId = user.id;
//     return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/notifications-${userId}`;
//   };

//   const fetchNotifications = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;

//     try {
//       const res = await fetch(`${userUri}.json`);
//       const data = await res.json();
//       if (data) {
//         const loaded = Object.entries(data).map(([key, value]: any) => ({
//           ...value,
//           id: key,
//           date: new Date(value.date),
//         }));
//         setNotifications(loaded.reverse());
//       }
//     } catch (e) {
//       console.warn("❌ Eroare la încărcarea notificărilor:", e);
//     }
//   };

//   // 🔹 Verifică notificările ratate la pornire
//   useEffect(() => {
//     const checkMissedNotifications = async () => {
//       if (!isLoaded || !user) return;

//       console.log("⏰ Verific notificările ratate...");
//       await fetchNotifications();

//       const now = new Date();
//       const missed = notificationsRef.current.filter(
//         (n) => !n.delivered && n.date < now
//       );

//       if (missed.length === 0) {
//         console.log("✅ Nicio notificare ratată.");
//         return;
//       }

//       console.log(`⚠️ Găsite ${missed.length} notificări ratate.`);
//       for (const n of missed) {
//         try {
//           console.log("🔄 Actualizez reminder pentru:", n.title);
//           await updateTodo({
//             id: n.todoId,
//             listName: n.listName,
//             text: n.title,
//             reminder: false,
//             reminderDate: null,
//           });
//           await updateNotification(n.id, { delivered: true });
//         } catch (err) {
//           console.warn("❌ Eroare la procesarea notificării:", n.id, err);
//         }
//       }

//       await fetchNotifications();
//     };

//     checkMissedNotifications();
//   }, [isLoaded, user]);

//   // 🔹 Permisiuni notificări și listener foreground
//   useEffect(() => {
//     const setupNotifications = async () => {
//       if (Platform.OS === "web") return;

//       try {
//         const { status } = await Notifications.getPermissionsAsync();
//         if (status !== "granted") {
//           const { status: newStatus } =
//             await Notifications.requestPermissionsAsync();
//           console.log("🎯 Requested notification status:", newStatus);
//         } else {
//           console.log("✅ Permisiuni pentru notificări OK");
//         }
//       } catch (e) {
//         console.warn("❌ Eroare verificare permisiuni notificări:", e);
//       }
//     };

//     setupNotifications();
//   }, []);

//   // 🔹 Configurare handler notificări
//   useEffect(() => {
//     Notifications.setNotificationHandler({
//       handleNotification: async () => ({
//         shouldShowBanner: true,
//         shouldShowList: true,
//         shouldPlaySound: true,
//         shouldSetBadge: false,
//       }),
//     });

//     const subscription = Notifications.addNotificationReceivedListener(
//       async (notification) => {
//         console.log(
//           "📬 Notification received (foreground):",
//           notification.request.content
//         );

//         const todoId = notification.request.content.data?.todoId as string;
//         const listName = notification.request.content.data?.listName as string;
//         const text = notification.request.content.data?.text as string;
//         const notificationId = notification.request.content.data
//           ?.firebaseId as string;

//         if (!todoId) return;

//         try {
//           await updateTodo({
//             id: todoId,
//             listName,
//             text,
//             reminder: false,
//             reminderDate: null,
//           });
//           await updateNotification(notificationId, { delivered: true });
//           await fetchNotifications();
//           console.log("🏁 updateTodo + updateNotification OK (foreground)");
//         } catch (error) {
//           console.log("❌ Eroare update foreground:", error);
//         }
//       }
//     );

//     return () => subscription.remove();
//   }, [todos, updateTodo]);

//   const scheduleNotification = async (
//     id: string,
//     title: string,
//     date: Date,
//     listName: string
//   ) => {
//     if (Platform.OS === "web") return;

//     try {
//       const newNotification: Omit<NotificationItem, "id"> = {
//         title,
//         body: title,
//         date,
//         read: false,
//         delivered: false,
//         todoId: id,
//         listName: listName,
//       };

//       const userUri = await getUserUri();
//       if (!userUri) return;

//       const res = await fetch(`${userUri}.json`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newNotification),
//       });

//       const data = await res.json();
//       const firebaseId = data.name;

//       setNotifications((prev) => [
//         { ...newNotification, id: firebaseId },
//         ...prev,
//       ]);

//       // Adăugăm identifier unic pentru fiecare notificare
//       const identifier = `${firebaseId}-${new Date().getTime()}`;

//       await Notifications.scheduleNotificationAsync({
//         identifier,
//         content: {
//           title: "Reminder",
//           body: title,
//           sound: "default",
//           data: { todoId: id, listName, text: title, firebaseId },
//         },
//         trigger: { type: "date", date } as any,
//       });
//     } catch (error) {
//       console.log("❌ Error scheduling notification:", error);
//     }
//   };

//   // 🔹 Funcții CRUD notificări
//   const markAllAsRead = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;

//     const updated: NotificationItem[] = [];
//     for (const n of notifications) {
//       if (!n.read) {
//         await fetch(`${userUri}/${n.id}.json`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ read: true }),
//         });
//       }
//       updated.push({ ...n, read: true });
//     }
//     setNotifications(updated);
//   };

//   const removeNotification = async (id: string) => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     await fetch(`${userUri}/${id}.json`, { method: "DELETE" });
//     setNotifications((prev) => prev.filter((n) => n.id !== id));
//   };

//   const updateNotification = async (
//     id: string,
//     data: Partial<NotificationItem>
//   ) => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     await fetch(`${userUri}/${id}.json`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ ...data }),
//     });
//   };

//   const clearNotifications = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     await fetch(`${userUri}.json`, { method: "DELETE" });
//     setNotifications([]);
//   };

//   const value = {
//     notifications,
//     scheduleNotification,
//     removeNotification,
//     clearNotifications,
//     markAllAsRead,
//     fetchNotifications,
//     updateNotification,
//   };

//   return (
//     <NotificationContext.Provider value={value}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);
// export default NotificationProvider;

// import { useTodos } from "@/store/todo-context";
// import { useUser } from "@clerk/clerk-expo";
// import * as Notifications from "expo-notifications";
// import { createContext, useContext, useEffect, useRef, useState } from "react";
// import { Platform } from "react-native";

// // 🌟 Tipul unei notificări
// type NotificationItem = {
//   id: string;
//   title: string;
//   body: string;
//   date: Date;
//   read: boolean;
//   delivered: boolean;
//   todoId: string;
//   listName: string;
// };

// // 🌟 Tipul contextului
// type NotificationContextType = {
//   notifications: NotificationItem[];
//   scheduleNotification: (
//     id: string,
//     title: string,
//     date: Date,
//     listName: string
//   ) => void;
//   removeNotification: (id: string) => void;
//   clearNotifications: () => void;
//   markAllAsRead: () => void;
//   fetchNotifications: () => void;
//   updateNotification: (notificationId: string, data: NotificationItem) => void;
// };

// export const NotificationContext = createContext<NotificationContextType>({
//   notifications: [],
//   scheduleNotification: () => {},
//   removeNotification: () => {},
//   clearNotifications: () => {},
//   markAllAsRead: () => {},
//   fetchNotifications: () => {},
//   updateNotification: () => {},
// });

// const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const { user, isLoaded } = useUser();
//   const { todos, updateTodo, fetchTodos } = useTodos();
//   const notificationsRef = useRef<NotificationItem[]>([]);
//   notificationsRef.current = notifications;

//   const getUserUri = async () => {
//     if (!isLoaded || !user) return null;
//     return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/notifications-${user.id}`;
//   };

//   const fetchNotifications = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;

//     try {
//       const res = await fetch(`${userUri}.json`);
//       const data = await res.json();
//       if (data) {
//         const loaded = Object.entries(data).map(([key, value]: any) => ({
//           ...value,
//           id: key,
//           date: new Date(value.date),
//         }));
//         setNotifications(loaded.reverse());
//       }
//     } catch (e) {
//       console.warn("❌ Eroare la încărcarea notificărilor:", e);
//     }
//   };

//   // 🔹 La pornire: verificăm notificările ratate și le procesăm
//   useEffect(() => {
//     const checkMissedNotifications = async () => {
//       if (!isLoaded || !user) return;

//       const userUri = await getUserUri();
//       if (!userUri) return;

//       try {
//         const res = await fetch(`${userUri}.json`);
//         const data = await res.json();
//         if (!data) return;

//         const loaded = Object.entries(data).map(([key, value]: any) => ({
//           ...value,
//           id: key,
//           date: new Date(value.date),
//         }));

//         const now = new Date();
//         const missed = loaded.filter((n) => !n.delivered && n.date < now);

//         for (const n of missed) {
//           try {
//             await updateTodo({
//               id: n.todoId,
//               listName: n.listName,
//               text: n.title,
//               reminder: false,
//               reminderDate: null,
//             });
//             await updateNotification(n.id, { delivered: true });
//           } catch (err) {
//             console.warn("❌ Eroare la procesarea notificării:", n.id, err);
//           }
//         }

//         await fetchNotifications();
//       } catch (e) {
//         console.warn("❌ Eroare la verificarea notificărilor:", e);
//       }
//     };

//     checkMissedNotifications();
//   }, [isLoaded, user]);

//   // 🔹 Încarcă notificările din Firebase
//   useEffect(() => {
//     if (!isLoaded || !user) return;
//     fetchNotifications();
//   }, [isLoaded, user]);

//   // 🔹 Permisiuni și listener foreground
//   useEffect(() => {
//     const setupNotifications = async () => {
//       if (Platform.OS === "web") return;

//       const { status } = await Notifications.getPermissionsAsync();
//       if (status !== "granted") {
//         await Notifications.requestPermissionsAsync();
//       }

//       Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowBanner: true,
//           shouldShowList: true,
//           shouldPlaySound: true,
//           shouldSetBadge: false,
//         }),
//       });

//       const subscription = Notifications.addNotificationReceivedListener(
//         async (notification) => {
//           const todoId = notification.request.content.data?.todoId as string;
//           const listName = notification.request.content.data
//             ?.listName as string;
//           const text = notification.request.content.data?.text as string;
//           const notificationId = notification.request.content.data
//             ?.firebaseId as string;

//           if (!todoId) return;

//           try {
//             await updateTodo({
//               id: todoId,
//               listName,
//               text,
//               reminder: false,
//               reminderDate: null,
//             });
//             await updateNotification(notificationId, { delivered: true });
//             fetchNotifications();
//           } catch (error) {
//             console.warn("❌ updateTodo failed:", error);
//           }
//         }
//       );

//       return () => subscription.remove();
//     };

//     setupNotifications();
//   }, [todos, updateTodo]);

//   // 🔹 Programare notificare
//   const scheduleNotification = async (
//     id: string,
//     title: string,
//     date: Date,
//     listName: string
//   ) => {
//     if (Platform.OS === "web") return;

//     try {
//       const newNotification: Omit<NotificationItem, "id"> = {
//         title,
//         body: title,
//         date,
//         read: false,
//         delivered: false,
//         todoId: id,
//         listName,
//         // delivered: false,
//       };

//       const userUri = await getUserUri();
//       if (!userUri) return;

//       const res = await fetch(`${userUri}.json`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newNotification),
//       });

//       const data = await res.json();
//       const firebaseId = data.name;

//       setNotifications((prev) => [
//         { ...newNotification, id: firebaseId },
//         ...prev,
//       ]);

//       // identifier unic ca să nu se piardă notificările apropiate
//       const identifier = `${firebaseId}-${new Date().getTime()}`;

//       await Notifications.scheduleNotificationAsync({
//         identifier,
//         content: {
//           title: "Reminder",
//           body: title,
//           sound: "default",
//           data: { todoId: id, listName, text: title, firebaseId },
//         },
//         trigger: { type: "date", date } as any,
//       });
//     } catch (error) {
//       console.warn("❌ Error scheduling notification:", error);
//     }
//   };

//   const markAllAsRead = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     try {
//       for (const n of notifications) {
//         if (!n.read) {
//           await fetch(`${userUri}/${n.id}.json`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ read: true }),
//           });
//         }
//       }
//       setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//     } catch (e) {
//       console.warn("❌ Error markAllAsRead:", e);
//     }
//   };

//   const removeNotification = async (id: string) => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     try {
//       await fetch(`${userUri}/${id}.json`, { method: "DELETE" });
//       setNotifications((prev) => prev.filter((n) => n.id !== id));
//     } catch (e) {
//       console.warn("❌ Error removeNotification:", e);
//     }
//   };

//   const updateNotification = async (
//     id: string,
//     data: Partial<NotificationItem>
//   ) => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     try {
//       await fetch(`${userUri}/${id}.json`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//     } catch (e) {
//       console.warn("❌ Error updateNotification:", e);
//     }
//   };

//   const clearNotifications = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     try {
//       await fetch(`${userUri}.json`, { method: "DELETE" });
//       setNotifications([]);
//     } catch (e) {
//       console.warn("❌ Error clearNotifications:", e);
//     }
//   };

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         scheduleNotification,
//         removeNotification,
//         clearNotifications,
//         markAllAsRead,
//         fetchNotifications,
//         updateNotification,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);
// export default NotificationProvider;

//  -----------------------------------⬇️ merge update la pornire ⬇️-----------------------------------------------------

// import { useTodos } from "@/store/todo-context";
// import { useUser } from "@clerk/clerk-expo";
// import * as Notifications from "expo-notifications";
// import { createContext, useContext, useEffect, useRef, useState } from "react";
// import { Platform } from "react-native";

// // 🌟 Tipul unei notificări
// type NotificationItem = {
//   id: string;
//   title: string;
//   body: string;
//   date: Date;
//   read: boolean;
//   delivered: boolean;
//   todoId: string;
//   listName: string;
// };

// // 🌟 Tipul contextului
// type NotificationContextType = {
//   notifications: NotificationItem[];
//   scheduleNotification: (
//     id: string,
//     title: string,
//     date: Date,
//     listName: string
//   ) => void;
//   removeNotification: (id: string) => void;
//   clearNotifications: () => void;
//   markAllAsRead: () => void;
//   fetchNotifications: () => void;
//   updateNotification: (
//     notificationId: string,
//     data: Partial<NotificationItem>
//   ) => void;
// };

// type ExpoPushTokenType = {
//   type: string;
//   data: string;
// };

// // 🌟 Contextul
// export const NotificationContext = createContext<NotificationContextType>({
//   notifications: [],
//   scheduleNotification: () => {},
//   removeNotification: () => {},
//   clearNotifications: () => {},
//   markAllAsRead: () => {},
//   fetchNotifications: () => {},
//   updateNotification: () => {},
// });

// const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const [expoPushToken, setExpoPushToken] = useState<ExpoPushTokenType | null>(
//     null
//   );
//   const { user, isLoaded } = useUser();
//   const { todos, updateTodo } = useTodos();
//   const notificationsRef = useRef<NotificationItem[]>([]);
//   notificationsRef.current = notifications;

//   const getUserUri = async () => {
//     if (!isLoaded || !user) return null;
//     return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/notifications-${user.id}`;
//   };

//   const fetchNotifications = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;

//     try {
//       const res = await fetch(`${userUri}.json`);
//       const data = await res.json();
//       if (data) {
//         const loaded = Object.entries(data).map(([key, value]: any) => ({
//           ...value,
//           id: key,
//           date: new Date(value.date),
//         }));
//         setNotifications(loaded.reverse());
//       }
//     } catch (e) {
//       console.warn("❌ Eroare la încărcarea notificărilor:", e);
//     }
//   };

//   // 🔹 Update la pornire pentru notificările care au trecut și nu sunt delivered
//   useEffect(() => {
//     const checkMissedNotifications = async () => {
//       if (!isLoaded || !user) return;

//       const userUri = await getUserUri();
//       if (!userUri) return;

//       try {
//         const res = await fetch(`${userUri}.json`);
//         const data = await res.json();
//         if (!data) return;

//         const loaded = Object.entries(data).map(([key, value]: any) => ({
//           ...value,
//           id: key,
//           date: new Date(value.date),
//         }));

//         const now = new Date();
//         const missed = loaded.filter((n) => !n.delivered && n.date < now);

//         for (const n of missed) {
//           try {
//             await updateTodo({
//               id: n.todoId,
//               listName: n.listName,
//               text: n.title,
//               reminder: false,
//               reminderDate: null,
//             });
//             await updateNotification(n.id, { delivered: true });
//           } catch (err) {
//             console.warn("❌ Eroare la procesarea notificării:", n.id, err);
//           }
//         }

//         await fetchNotifications();
//       } catch (e) {
//         console.warn("❌ Eroare la verificarea notificărilor:", e);
//       }
//     };

//     checkMissedNotifications();
//   }, [isLoaded, user]);

//   // 🔹 Permisiuni și listener foreground
//   useEffect(() => {
//     const setupNotifications = async () => {
//       if (Platform.OS === "web") return;

//       const { status } = await Notifications.getPermissionsAsync();
//       if (status !== "granted") {
//         await Notifications.requestPermissionsAsync();
//       }

//       Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowBanner: true,
//           shouldShowList: true,
//           shouldPlaySound: true,
//           shouldSetBadge: false,
//         }),
//       });

//       const subscription = Notifications.addNotificationReceivedListener(
//         async (notification) => {
//           const data = notification.request.content.data as {
//             todoId: string;
//             listName: string;
//             text?: string;
//             firebaseId?: string;
//           };
//           if (!data?.todoId) return;

//           try {
//             await updateTodo({
//               id: data.todoId,
//               listName: data.listName as string,
//               reminder: false,
//               reminderDate: null,
//             });
//             await updateNotification(data.firebaseId as string, {
//               delivered: true,
//             });
//             await fetchNotifications();
//           } catch (err) {
//             console.warn("❌ Error updating todo from notification:", err);
//           }
//         }
//       );

//       return () => subscription.remove();
//     };

//     setupNotifications();
//   }, [todos, updateTodo]);

//   const scheduleNotification = async (
//     id: string,
//     title: string,
//     date: Date,
//     listName: string
//   ) => {
//     if (Platform.OS === "web") return;

//     try {
//       const newNotification: Omit<NotificationItem, "id"> = {
//         title,
//         body: title,
//         date,
//         read: false,
//         delivered: false,
//         todoId: id,
//         listName,
//       };

//       const userUri = await getUserUri();
//       if (!userUri) return;

//       const res = await fetch(`${userUri}.json`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newNotification),
//       });

//       const firebaseId = res && (await res.json()).name;
//       setNotifications((prev) => [
//         { ...newNotification, id: firebaseId },
//         ...prev,
//       ]);

//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title: "Reminder",
//           body: title,
//           sound: "default",
//           data: { todoId: id, listName, text: title, firebaseId },
//         },
//         trigger: { type: "date", date } as any,
//         identifier: `${firebaseId}-${new Date().getTime()}`,
//       });
//     } catch (err) {
//       console.warn("❌ Error scheduling notification:", err);
//     }
//   };

//   useEffect(() => {
//     const getExpoPushToken = async () => {
//       const token = await Notifications.getExpoPushTokenAsync();
//       setExpoPushToken(token); // acum tipurile se potrivesc
//     };

//     getExpoPushToken();
//   }, []);

//   const updateNotification = async (
//     id: string,
//     data: Partial<NotificationItem>
//   ) => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     await fetch(`${userUri}/${id}.json`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//   };

//   const removeNotification = async (id: string) => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     await fetch(`${userUri}/${id}.json`, { method: "DELETE" });
//     setNotifications((prev) => prev.filter((n) => n.id !== id));
//   };

//   const clearNotifications = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     await fetch(`${userUri}.json`, { method: "DELETE" });
//     setNotifications([]);
//   };

//   const markAllAsRead = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;

//     for (const n of notifications) {
//       if (!n.read) await updateNotification(n.id, { read: true });
//     }
//     setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//   };

//   const value = {
//     notifications,
//     scheduleNotification,
//     removeNotification,
//     clearNotifications,
//     markAllAsRead,
//     fetchNotifications,
//     updateNotification,
//   };

//   return (
//     <NotificationContext.Provider value={value}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);
// export default NotificationProvider;

//---------------------------------------------------------------------------------------------

// import { useTodos } from "@/store/todo-context";
// import { useUser } from "@clerk/clerk-expo";
// import * as Notifications from "expo-notifications";
// import { createContext, useContext, useEffect, useRef, useState } from "react";
// import { Platform } from "react-native";

// type NotificationItem = {
//   id: string;
//   title: string;
//   body: string;
//   date: Date;
//   read: boolean;
//   delivered: boolean;
//   todoId: string;
//   listName: string;
// };

// type NotificationContextType = {
//   notifications: NotificationItem[];
//   scheduleNotification: (
//     id: string,
//     title: string,
//     date: Date,
//     listName: string
//   ) => void;
//   removeNotification: (id: string) => void;
//   clearNotifications: () => void;
//   markAllAsRead: () => void;
//   fetchNotifications: () => void;
//   updateNotification: (id: string, data: Partial<NotificationItem>) => void;
// };

// export const NotificationContext = createContext<NotificationContextType>({
//   notifications: [],
//   scheduleNotification: () => {},
//   removeNotification: () => {},
//   clearNotifications: () => {},
//   markAllAsRead: () => {},
//   fetchNotifications: () => {},
//   updateNotification: () => {},
// });

// const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const { user, isLoaded } = useUser();
//   const { updateTodo } = useTodos();
//   const notificationsRef = useRef<NotificationItem[]>([]);
//   notificationsRef.current = notifications;

//   const getUserUri = async () => {
//     if (!isLoaded || !user) return null;
//     return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/notifications-${user.id}`;
//   };

//   const fetchNotifications = async () => {
//     const userUri = await getUserUri();
//     if (!userUri) return;

//     try {
//       const res = await fetch(`${userUri}.json`);
//       const data = await res.json();
//       if (!data) {
//         setNotifications([]);
//         return;
//       }

//       const loaded = Object.entries(data).map(([key, value]: any) => ({
//         ...value,
//         id: key,
//         date: new Date(value.date),
//       }));

//       setNotifications(loaded.reverse());
//     } catch (e) {
//       console.warn("❌ Eroare la încărcarea notificărilor:", e);
//     }
//   };

//   const updateNotification = async (
//     id: string,
//     data: Partial<NotificationItem>
//   ) => {
//     const userUri = await getUserUri();
//     if (!userUri) return;
//     await fetch(`${userUri}/${id}.json`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//   };

//   // 🔹 La pornire: verific notificările ratate și le aplic
//   useEffect(() => {
//     if (!isLoaded || !user) return;

//     const checkMissedNotifications = async () => {
//       // 1️⃣ Încarcă notificările
//       await fetchNotifications();

//       // 2️⃣ Folosește notificationsRef după ce s-au setat
//       const now = new Date();
//       const missed = notificationsRef.current.filter(
//         (n) => !n.delivered && n.date < now
//       );

//       if (missed.length === 0) {
//         console.log("✅ Nicio notificare ratată.");
//         return;
//       }

//       console.log(`⚠️ Găsite ${missed.length} notificări ratate.`);

//       for (const n of missed) {
//         try {
//           await updateTodo({
//             id: n.todoId,
//             listName: n.listName,
//             reminder: false,
//             reminderDate: null,
//           });
//           await updateNotification(n.id, { delivered: true });
//         } catch (err) {
//           console.warn("❌ Eroare la notificarea ratată:", n.id, err);
//         }
//       }

//       // 3️⃣ Reîncarcă lista după update
//       await fetchNotifications();
//     };

//     checkMissedNotifications();
//   }, [isLoaded, user]);

//   // 🔹 Permisiuni + handler notificări foreground
//   useEffect(() => {
//     if (Platform.OS === "web") return;

//     const setupNotifications = async () => {
//       const { status } = await Notifications.getPermissionsAsync();
//       if (status !== "granted") {
//         await Notifications.requestPermissionsAsync();
//       }

//       Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowBanner: true,
//           shouldShowList: true,
//           shouldPlaySound: true,
//           shouldSetBadge: false,
//         }),
//       });

//       const sub = Notifications.addNotificationReceivedListener(
//         async (notification) => {
//           const todoId = notification.request.content.data?.todoId as string;
//           const listName = notification.request.content.data
//             ?.listName as string;
//           const text = notification.request.content.data?.text as string;
//           const notificationId = notification.request.content.data
//             ?.firebaseId as string;

//           if (!todoId) return;

//           try {
//             await updateTodo({
//               id: todoId,
//               listName,
//               text,
//               reminder: false,
//               reminderDate: null,
//             });
//             await updateNotification(notificationId, { delivered: true });
//             await fetchNotifications();
//           } catch (err) {
//             console.warn("❌ Eroare la listener notificare:", err);
//           }
//         }
//       );

//       return () => sub.remove();
//     };

//     setupNotifications();
//   }, [updateTodo]);

//   const scheduleNotification = async (
//     id: string,
//     title: string,
//     date: Date,
//     listName: string
//   ) => {
//     if (Platform.OS === "web") return;

//     const newNotification: Omit<NotificationItem, "id"> = {
//       title,
//       body: title,
//       date,
//       read: false,
//       delivered: false,
//       todoId: id,
//       listName,
//     };

//     const userUri = await getUserUri();
//     if (!userUri) return;

//     const res = await fetch(`${userUri}.json`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newNotification),
//     });
//     const firebaseId = (await res.json()).name;

//     setNotifications((prev) => [
//       { ...newNotification, id: firebaseId },
//       ...prev,
//     ]);

//     await Notifications.scheduleNotificationAsync({
//       identifier: `${firebaseId}-${Date.now()}`, // ID unic
//       content: {
//         title: "Reminder",
//         body: title,
//         sound: "default",
//         data: { todoId: id, listName, text: title, firebaseId },
//       },
//       trigger: { type: "date", date } as any,
//     });
//   };

// const markAllAsRead = async () => {
//   const userUri = await getUserUri();
//   if (!userUri) return;

//   for (const n of notifications) {
//     if (!n.read) {
//       await updateNotification(n.id, { read: true });
//     }
//   }

//   setNotifications(notifications.map((n) => ({ ...n, read: true })));
// };

// const removeNotification = async (id: string) => {
//   const userUri = await getUserUri();
//   if (!userUri) return;

//   await fetch(`${userUri}/${id}.json`, { method: "DELETE" });
//   setNotifications((prev) => prev.filter((n) => n.id !== id));
// };

// const clearNotifications = async () => {
//   const userUri = await getUserUri();
//   if (!userUri) return;

//   await fetch(`${userUri}.json`, { method: "DELETE" });
//   setNotifications([]);
// };

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         scheduleNotification,
//         removeNotification,
//         clearNotifications,
//         markAllAsRead,
//         fetchNotifications,
//         updateNotification,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);
// export default NotificationProvider;

import { useTodos } from "@/store/todo-context";
import { useUser } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
<<<<<<< Updated upstream
import {
  createContext,
  use,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
=======
import { createContext, useContext, useEffect, useRef, useState } from "react";
>>>>>>> Stashed changes
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
