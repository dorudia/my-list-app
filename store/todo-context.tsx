import { useUser } from "@clerk/clerk-expo";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

export type Todo = {
  id: string;
  listName: string;
  text?: string;
  completed?: boolean;
  reminder?: boolean;
  reminderDate?: Date | null;
};

export type TodosContextType = {
  todos: Todo[];
  bgColor: string;
  setBackgroundColor: (color: string) => void;
  userLists: string[];
  fetchTodos: (listName: string) => Promise<Todo[] | void>;
  addTodo: (text: string, listName: string) => Promise<Todo | void>;
  updateTodo: (
    todo: Partial<Todo> & { id: string; listName: string }
  ) => Promise<void>;
  deleteTodo: (id: string, listName: string) => Promise<void>;
  deleteTodos: (listName: string) => Promise<void>;
  getUserLists: () => Promise<void>;
  addList: (text: string) => Promise<void>;
  deleteList: (text: string) => Promise<void>;
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
  const [userLists, setUserLists] = useState<string[]>([]);
  const { user, isLoaded } = useUser();
  const [bgColor, setBgColor] = useState("#fff");

  const setBgColorHandler = async (color: string) => {
    setBgColor(color);
    try {
      await SecureStore.setItemAsync("bgColor", color);
      const savedColor = await SecureStore.getItemAsync("bgColor");
      console.log("✅Culoare salvata in SecureStore:", { savedColor });
    } catch (e) {
      console.log("Eroare la salvare culoare in SecureStore", e);
    }
  };

  const getUserUri = async () => {
    if (!isLoaded || !user) return null;
    const userId = user.id;
    return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/liste-${userId}`;
  };

  const addList = async (text: string) => {
    const uri = await getUserUri();
    if (!uri) return;
    if (text.trim() === "") {
      Alert.alert("Error", "List name cannot be empty!");
      return;
    }
    if (userLists.includes(text.trim())) {
      Alert.alert("Error", "List name already exists!");
      return;
    }
    try {
      await fetch(`${uri}/${text}.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createdAt: Date.now() }),
      });
      setUserLists((prev) => [text, ...prev]);
    } catch (err) {
      console.log("Error in addList:", err);
    }
  };

  const deleteList = async (listName: string) => {
    const uri = await getUserUri();
    if (!uri) return;
    try {
      await fetch(`${uri}/${listName}.json`, { method: "DELETE" });
      setUserLists((prev) => prev.filter((l) => l !== listName));
    } catch (err) {
      console.log("Error deleting list:", err);
    }
  };

  const getUserLists = async () => {
    const uri = await getUserUri();
    if (!uri) return;
    try {
      const res = await fetch(`${uri}.json`);
      const data = await res.json();
      if (!data) {
        setUserLists([]);
        return;
      }
      const listsArray = Object.keys(data)
        .map((listName) => {
          const firstKey = Object.keys(data[listName])[0];
          const createdAt = data[listName][firstKey]?.createdAt || 0;
          return { name: listName, createdAt };
        })
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((l) => l.name);
      setUserLists(listsArray);
    } catch (err) {
      console.log("Error in getUserLists:", err);
    }
  };

  const addTodo = async (text: string, listName: string) => {
    const uri = await getUserUri();
    if (!uri) return;
    if (text.trim() === "") {
      Alert.alert("Error", "Todo text cannot be empty!");
      return;
    }
    if (todos.some((t) => t.text === text)) {
      Alert.alert("Error", "Todo text already exists!");
      return;
    }

    const res = await fetch(`${uri}/${listName}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        completed: false,
        reminder: false,
        reminderDate: null,
        listName,
      }),
    });
    const data = await res.json();
    const id = data.name;

    await fetch(`${uri}/${listName}/${id}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    return {
      id,
      text,
      completed: false,
      reminder: false,
      reminderDate: null,
      listName,
    };
  };

  const deleteTodo = async (id: string, listName: string) => {
    const uri = await getUserUri();
    if (!uri) return;
    try {
      await fetch(`${uri}/${listName}/${id}.json`, { method: "DELETE" });
    } catch (err) {
      console.log("Error deleting todo:", err);
    } finally {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const fetchTodos = async (listName: string) => {
    const uri = await getUserUri();
    if (!uri) return;
    try {
      const res = await fetch(`${uri}/${listName}.json`);
      const data = await res.json();
      if (!data) {
        setTodos([]);
        return [];
      }
      const todosArray: Todo[] = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      setTodos(todosArray.filter((t) => t.text !== undefined));
      return todosArray;
    } catch (err) {
      console.log("Error fetching todos:", err);
    }
  };

  const updateTodo = async (
    todo: Partial<Todo> & { id: string; listName: string }
  ) => {
    const uri = await getUserUri();
    if (!uri) {
      console.log("⚠️ User not authenticated for updateTodo.");
      return;
    }

    const { id, listName, ...rest } = todo;

    if (!id || !listName) {
      console.log("⚠️ Missing id or listName for updateTodo", todo);
      return;
    }

    try {
      const res = await fetch(`${uri}/${listName}/${id}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      });

      if (!res.ok) {
        console.log("❌ HTTP Error:", res.status);
        return;
      }
      setTodos((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              ...rest,
            };
          }
          return t;
        })
      );
      console.log("✅ Todo updated on Firebase:", id, rest);

      // 🔹 Actualizează și starea locală pentru UI instant
    } catch (err) {
      console.log("❌ Error updating todo:", err);
    }
  };

  // când user-ul e gata, procesăm notificările rămase

  // const updateTodo = async (
  //   todo: Partial<Todo> & { id: string; listName: string }
  // ) => {
  //   const uri = await getUserUri();
  //   if (!uri) return;
  //   const { id, listName, ...rest } = todo;
  //   if (!id || !listName) return;
  //   try {
  //     await fetch(`${uri}/${listName}/${id}.json`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(rest),
  //     });
  //     fetchTodos(listName);
  //   } catch (err) {
  //     console.log("Error updating todo:", err);
  //   }
  // };

  // const updateTodo = async (
  //   todo: Partial<Todo> & { id: string; listName: string }
  // ) => {
  //   const uri = await getUserUri();
  //   if (!uri) {
  //     console.log("⚠️ User not authenticated for updateTodo.");
  //     return;
  //   }

  //   const { id, listName, ...rest } = todo;

  //   if (!id || !listName) {
  //     console.log("⚠️ Missing id or listName for updateTodo", todo);
  //     return;
  //   }

  //   // Dacă nu ai alte câmpuri de actualizat, ieși fără a face PATCH
  //   if (Object.keys(rest).length === 0) {
  //     console.log("ℹ️ Nothing to update for todo:", id);
  //     return;
  //   }

  //   try {
  //     const res = await fetch(`${uri}/${listName}/${id}.json`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(rest),
  //     });

  //     if (!res.ok) {
  //       console.log("❌ HTTP Error:", res.status);
  //     } else {
  //       console.log("✅ Todo updated:", id, rest);
  //     }
  //   } catch (err) {
  //     console.log("❌ Error updating todo:", err);
  //   }
  // };

  const deleteTodos = async (listName: string) => {
    const uri = await getUserUri();
    if (!uri) return;
    try {
      await fetch(`${uri}/${listName}.json`, { method: "DELETE" });
      setTodos([]);
    } catch (err) {
      console.log("Error deleting todos:", err);
    }
  };

  // Get background color from secure storage
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
    getUserLists();
  }, []);

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
    <TodosContext.Provider value={value}>{children}</TodosContext.Provider>
  );
};

export const useTodos = () => useContext(TodosContext);
export default TodoProvider;
