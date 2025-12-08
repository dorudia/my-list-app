import { useUser, useAuth } from "@clerk/clerk-expo";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { NotificationProvider } from "@/store/notification-context";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import Constants from "expo-constants";

// Detectează automat mediul
const API_URL = __DEV__
  ? "http://192.168.0.216:3000" // Development local server
  : "https://my-list-app-server.onrender.com"; // Production

console.log("🌐 API_URL:", API_URL, "| DEV mode:", __DEV__);

export type Todo = {
  _id: string;
  userId: string;
  listName: string;
  text?: string;
  completed?: boolean;
  reminder?: boolean;
  reminderDate?: Date | null;
  link?: string;
  phone?: string;
};

export type UserList = {
  _id: string;
  name: string;
  userId: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TodosContextType = {
  todos: Todo[];
  bgColor: string;
  setBackgroundColor: (color: string) => void;
  userLists: UserList[];
  fetchTodos: (listName: string) => Promise<Todo[] | void>;
  addTodo: (text: string, listName: string) => Promise<Todo | void>;
  updateTodo: (
    todo: Partial<Todo> & { _id: string; listName: string }
  ) => Promise<void>;
  deleteTodo: (id: string, listName: string) => Promise<void>;
  deleteTodos: (listName: string) => Promise<void>;
  getUserLists: () => Promise<void>;
  addList: (text: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
};

export const TodosContext = createContext<TodosContextType>({
  todos: [],
  bgColor: "#fff",
  setBackgroundColor: () => {},
  userLists: [],
  fetchTodos: async () => {},
  addTodo: async () => {},
  updateTodo: async () => {},
  deleteTodo: async () => {},
  deleteTodos: async () => {},
  getUserLists: async () => {},
  addList: async () => {},
  deleteList: async () => {},
});

const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [bgColor, setBgColor] = useState("#fff");

  const setBgColorHandler = async (color: string) => {
    setBgColor(color);
    try {
      await SecureStore.setItemAsync("bgColor", color);
    } catch (e) {
      console.log("Eroare la salvare culoare in SecureStore", e);
    }
  };

  const getUserLists = async () => {
    if (!isLoaded || !user) return;
    const token = await getToken();

    console.log(
      "📋 Fetching lists for user:",
      user.id,
      "from:",
      `${API_URL}/lists/${user.id}`
    );

    try {
      const res = await fetch(`${API_URL}/lists/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data: UserList[] = await res.json();
      console.log("📋 Lists received:", data?.length || 0, "lists");
      setUserLists(data || []);
    } catch (err) {
      console.log("❌ Error fetching lists:", err);
    }
  };

  const addList = async (text: string) => {
    if (!isLoaded || !user) return;
    const token = await getToken();
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert("Error", "List name cannot be empty!");
      return;
    }
    if (userLists.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert("Error", "List name already exists!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/lists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmed, userId: user.id }),
      });
      const data: UserList = await res.json();
      if (res.ok) {
        setUserLists((prev) => [...prev, data]);
      } else {
        Alert.alert("Error", "Eroare la creare listă");
      }
    } catch (err) {
      console.log("Error in addList:", err);
    }
  };

  const deleteList = async (listId: string) => {
    const token = await getToken();
    try {
      await fetch(`${API_URL}/lists/${listId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserLists((prev) => prev.filter((l) => l._id !== listId));
    } catch (err) {
      console.log("Error deleting list:", err);
    }
  };

  const fetchTodos = async (listName: string) => {
    if (!user) return;
    const token = await getToken();
    try {
      const res = await fetch(`${API_URL}/todos/${user.id}/${listName}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data: Todo[] = await res.json();
      // console.log({ data });

      setTodos(data || []);
      return data;
    } catch (err) {
      console.log("Error fetching todos:", err);
    }
  };

  const addTodo = async (text: string, listName: string) => {
    if (!user || text.trim() === "") return;
    const token = await getToken();

    try {
      const res = await fetch(`${API_URL}/todos/${user.id}/${listName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      const newTodo: Todo = await res.json();
      // actualizare UI instant
      setTodos((prev) => [...prev, newTodo]);
    } catch (err) {
      console.log("Error adding todo:", err);
    }
  };

  const updateTodo = async (
    todo: Partial<Todo> & { _id: string; listName: string }
  ) => {
    if (!user) return;
    const token = await getToken();
    console.log("🔄 todo-context updateTodo called with:", todo);

    // Convertește undefined în null pentru a trimite prin JSON
    const todoToSend: any = {};
    Object.keys(todo).forEach((key) => {
      const value = (todo as any)[key];
      todoToSend[key] = value === undefined ? null : value;
    });

    console.log("📤 Sending to backend:", todoToSend);

    try {
      const res = await fetch(
        `${API_URL}/todos/${user.id}/${todo.listName}/${todo._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(todoToSend),
        }
      );
      const updated: Todo = await res.json();
      console.log("✅ Backend returned:", updated);
      // actualizare UI instant
      setTodos((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
    } catch (err) {
      console.log("Error updating todo:", err);
    }
  };

  // DELETE toate todos dintr-o listă
  const deleteTodos = async (listName: string) => {
    if (!user) return;
    const token = await getToken();
    try {
      await fetch(`${API_URL}/todos/${user.id}/${listName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos([]);
    } catch (err) {
      console.log("Error deleting todos:", err);
    }
  };

  // DELETE un singur todo
  const deleteTodo = async (id: string, listName: string) => {
    if (!user) return;
    const token = await getToken();
    try {
      await fetch(`${API_URL}/todos/${user.id}/${listName}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.log("Error deleting todo:", err);
    }
  };

  useEffect(() => {
    const loadBgColor = async () => {
      try {
        const savedColor = await SecureStore.getItemAsync("bgColor");
        if (savedColor) setBgColor(savedColor);
      } catch (e) {
        console.log("Eroare la citire culoare", e);
      }
    };
    loadBgColor();
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      getUserLists();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const checkTodosReminders = async () => {
      if (!isLoaded || !user) return;

      console.log("[DEBUG] userLists in checkTodosReminders:", userLists);
      const now = new Date();
      const token = await getToken();

      // iterăm prin toate listele utilizatorului
      for (const list of userLists) {
        console.log(`[DEBUG] Checking list: ${list.name}`);
        // Fetch todos fără a seta state-ul global
        try {
          const res = await fetch(`${API_URL}/todos/${user.id}/${list.name}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const todos: Todo[] = await res.json();
          console.log(`[DEBUG] Todos fetched for list ${list.name}:`, todos);
          if (!todos) continue;

          let reminderDisabled = false;
          for (const todo of todos) {
            if (!todo.reminderDate) continue;

            const reminderTime = new Date(todo.reminderDate);
            if (reminderTime <= now && todo.reminder) {
              // dezactivează reminder-ul și resetează reminderDate
              await updateTodo({
                _id: todo._id,
                listName: todo.listName,
                reminder: false,
                reminderDate: null,
              });
              console.log(
                `[DEBUG] Reminder dezactivat pentru todo: ${todo._id}`
              );
              reminderDisabled = true;
            }
          }
          // Dacă s-a dezactivat vreun reminder, refă fetch pentru lista curentă
          if (reminderDisabled) {
            console.log(
              `[DEBUG] Refetching todos for list: ${list.name} to update UI`
            );
            await fetchTodos(list.name);
          }
        } catch (err) {
          console.log("Error checking reminders for list:", list.name, err);
        }
      }
    };

    checkTodosReminders();
  }, [isLoaded, user, userLists]);

  const value: TodosContextType = {
    todos,
    bgColor,
    setBackgroundColor: setBgColorHandler,
    userLists,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    deleteTodos,
    getUserLists,
    addList,
    deleteList,
  };

  return (
    <TodosContext.Provider value={value}>
      <NotificationProvider token={getToken}>{children}</NotificationProvider>
    </TodosContext.Provider>
  );
};

export const useTodos = () => useContext(TodosContext);
export default TodoProvider;
