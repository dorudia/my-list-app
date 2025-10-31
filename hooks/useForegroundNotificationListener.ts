// import { useTodos } from "@/store/todo-context";
// import * as Notifications from "expo-notifications";
// import { useEffect } from "react";

// export const useForegroundNotificationListener = () => {
//   const { todos, updateTodo } = useTodos();

//   useEffect(() => {
//     // Listener pentru notificările primite în foreground
//     const subscription = Notifications.addNotificationReceivedListener(
//       async (notification) => {
//         console.log("📬 Notification received:", notification.request.content);

//         // Extragem todoId din notificare
//         const todoId = notification.request.content.data?.todoId;
//         if (!todoId) return;

//         // Găsim todo-ul asociat
//         const todo = todos.find((t) => t.id === todoId);
//         if (!todo || !todo.reminder) return;

//         // Resetăm reminder-ul folosind updateTodo
//         await updateTodo(
//           todo.id,
//           "default", // sau listName dacă îl ai
//           todo.text,
//           todo.completed,
//           false, // reminder off
//           undefined // reminderDate off
//         );

//         console.log(`✅ Reminder reset for todo: ${todo.text}`);
//       }
//     );

//     // Cleanup la demontare
//     return () => subscription.remove();
//   }, [todos, updateTodo]);
// };
