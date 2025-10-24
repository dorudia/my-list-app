import { useUser } from "@clerk/clerk-expo";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

type Todo = {
  id: string;
  listName: string;
  text?: string;
  completed?: boolean;
  reminder?: boolean;
  reminderDate?: Date | null;
};

type TodosContextType = {
  todos: Todo[];
  userLists: string[];
  fetchTodos: (listName: string) => void;
  addTodo: (text: string, listName: string) => void;
  updateTodo: ({
    id,
    listName,
    text,
    completed,
    reminder,
    reminderDate,
  }: Todo) => void;
  deleteTodo: (id: string, listName: string) => void;
  deleteTodos: (listName: string) => void;
  getUserLists: () => void;
  addList: (text: string) => void;
  deleteList: (text: string) => void;
  // scheduleNotification: (title: string, date: Date) => void;
};

export const TodosContext = createContext<TodosContextType>({
  todos: [],
  userLists: [],
  fetchTodos: () => {},
  addTodo: () => {},
  updateTodo: () => {},
  deleteTodo: () => {},
  deleteTodos: () => {},
  getUserLists: () => {},
  addList: () => {},
  deleteList: () => {},
  // scheduleNotification: () => {},
});

// const uri =
//   "https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/todos";

const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [userLists, setUserLists] = useState<string[]>([]);
  const { user, isLoaded } = useUser();

  const getUserUri = async () => {
    // ia user-ul curent din Clerk
    if (!isLoaded || !user) return null;

    const userId = user.id; // Clerk generează un ID unic pentru fiecare utilizator
    return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/liste-${userId}`;
  };

  const addList = async (text: string) => {
    const uri = await getUserUri();
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
        body: JSON.stringify({
          createdAt: new Date().toISOString().slice(0, 10),
        }),
      });
      // Actualizeaza lista de liste dupa adaugare
      setUserLists((prevLists) => [text, ...prevLists]);
    } catch (error) {
      console.log("Error in addList to firebase:", error);
    }
  };

  const deleteList = async (listName: string) => {
    const uri = await getUserUri(); // nodul părinte: /liste/liste-userId
    try {
      await fetch(`${uri}/${listName}.json`, {
        method: "DELETE",
      });
      // Actualizează lista de liste după ștergere
      const updatedLists = userLists.filter((name) => name !== listName);
      setUserLists(updatedLists);
    } catch (error) {
      console.log("Error deleting list:", error);
    }
  };

  const getUserLists = async () => {
    const uri = await getUserUri();
    try {
      const response = await fetch(uri + ".json");
      const data = await response.json();

      if (!data) {
        setUserLists([]);
        return;
      }
      // console.log("userLists from firebase:", data);
      const listsArray = Object.keys(data).map((listName) => {
        const firstChildKey = Object.keys(data[listName])[0];
        const createdAt = data[listName][firstChildKey]?.createdAt || 0;
        return { name: listName, createdAt };
      });
      const sortedLists = listsArray.sort((a, b) => b.createdAt - a.createdAt);
      setUserLists(sortedLists.map((list) => list.name));
      return Object.keys(data);
    } catch (error) {
      console.log("Error in getUserLists from firebase:", error);
    }
  };

  const addTodo = async (text: string, listName: string) => {
    const uri = await getUserUri();
    if (text.trim() === "") {
      Alert.alert("Error", "Todo text cannot be empty!");
      return;
    }
    if (todos.some((todo) => todo.text === text)) {
      Alert.alert("Error", "Todo text already exists!");
      return;
    }
    const response = await fetch(`${uri}/${listName}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        completed: false,
        reminder: false,
        reminderDate: null,
        listName: listName,
      }),
    });
    return response.json();
  };

  const deleteTodo = async (id: string, listName: string) => {
    const uri = await getUserUri();
    try {
      await fetch(`${uri}/${listName}/${id}.json`, {
        method: "DELETE",
      });
    } catch (error) {
      console.log("delete from firebase:", error);
    } finally {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const fetchTodos = async (listName: string) => {
    const uri = await getUserUri();
    const response = await fetch(`${uri}/${listName}.json`);
    const data = await response.json();
    if (!data) {
      setTodos([]);
      return;
    }
    const todos = Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));

    setTodos(todos.filter((todo) => todo.text !== undefined));
    return todos;
  };

  const updateTodo = async ({
    id,
    listName,
    text,
    completed,
    reminder,
    reminderDate,
  }: Todo) => {
    const uri = await getUserUri();
    console.log("updateTodo apelat!:", { id, text, completed, reminder });

    try {
      // Actualizează Firebase
      await fetch(`${uri}/${listName}/${id}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, completed, reminder, reminderDate }),
      });
    } catch (error) {
      console.log("Error in updateTodos: ", error);
    } finally {
      listName && fetchTodos(listName); // Reîncarcă lista după update
    }
  };

  // const updateTodo = async (
  //   id: string,
  //   listName: string,
  //   text: string,
  //   completed: boolean,
  //   reminder?: boolean,
  //   reninderDate?: Date
  // ) => {
  //   const uri = await getUserUri();
  //   try {
  //     const response = await fetch(`${uri}/${listName}/${id}.json`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ text, completed, reminder, reninderDate }),
  //     });
  //     return response.json();
  //   } catch (error) {
  //     console.log("Error in updateTodos: ", error);
  //   } finally {
  //     fetchTodos(listName);
  //   }
  // };

  const deleteTodos = async (listName: string) => {
    const uri = await getUserUri();
    try {
      await fetch(`${uri}/${listName}.json`, {
        method: "DELETE",
      });
    } catch (error) {
      console.log("Something went wrong deleting Todos!", error);
    } finally {
      setTodos([]);
    }
  };

  useEffect(() => {
    getUserLists();
  }, []);

  const value = {
    todos,
    userLists,
    addTodo,
    fetchTodos,
    updateTodo,
    deleteTodo,
    deleteTodos,
    getUserLists,
    addList,
    deleteList,
    // scheduleNotification,
  };

  return (
    <TodosContext.Provider value={value}>{children}</TodosContext.Provider>
  );
};

export const useTodos = () => {
  return useContext(TodosContext);
};

export default TodoProvider;
