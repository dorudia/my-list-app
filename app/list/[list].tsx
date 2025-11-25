import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTodos } from "@/store/todo-context";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import NotificatinoButton from "@/components/NotificatinoButton";
import TodoComponent from "../../components/todo";
import UserContainer from "@/components/UserContainer";

export default function Index() {
  const { todos, addTodo, fetchTodos, deleteTodos, updateTodo } = useTodos();
  const { isLoaded, isSignedIn, user } = useUser();
  const { list } = useLocalSearchParams<{ list: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { bgColor } = useTodos();

  // Redirect dacă nu ești logat
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  // Back button handling
  useEffect(() => {
    const backAction = () => {
      if (!isSignedIn) {
        router.replace("/(auth)/sign-in");
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !user || !list) return;

    // apelează fetchTodos pentru lista selectată
    fetchTodos(list);
  }, [isLoaded, user, list]);

  // Setare header
  const capitalizeWords = (str: string) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: list ? capitalizeWords(list) : "Todos",
      headerRight: () => <NotificatinoButton />,
      headerStyle: { backgroundColor: bgColor },
      contentStyle: { backgroundColor: bgColor },
    });
  }, [navigation, bgColor, list]);

  // Fetch todos la mount sau când list se schimbă
  useEffect(() => {
    if (!list) return;
    let isMounted = true;

    const loadTodos = async () => {
      setIsLoading(true);
      const fetched = await fetchTodos(list);
      if (isMounted && fetched) setIsLoading(false);
    };
    loadTodos();

    return () => {
      isMounted = false;
    };
  }, [list]);

  // Submit todo
  const submitHandler = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      Alert.alert("Error", "Name cannot be empty!");
      return;
    }
    if (todos.some((t) => t.text === trimmed)) {
      Alert.alert("Error", "Name already exists!");
      return;
    }

    setIsLoading(true);
    await addTodo(trimmed, list); // backend adaugă
    // await fetchTodos(list); // fetch complet după adăugare
    setInputValue("");
    setIsLoading(false);
  };

  // Delete all todos
  const deleteTodosHandler = () => {
    Alert.alert("Delete All", "Are you sure you want to delete all todos?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          setIsLoading(true);
          await deleteTodos(list);
          await fetchTodos(list); // fetch complet după delete
          setIsLoading(false);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ paddingTop: 70 }}>
        <ActivityIndicator size="large" color="#3c81c7" />
      </View>
    );
  }

  if (!isLoaded || !isSignedIn) return null;

  return (
    <View style={styles.container}>
      <UserContainer />
      <Text style={styles.addLabel}>Add New Item</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="New item"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={submitHandler}
        />
        <TouchableOpacity style={styles.button} onPress={submitHandler}>
          <Text adjustsFontSizeToFit style={styles.buttonText}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ width: "100%", marginTop: 10, marginBottom: 50 }}
      >
        {todos.map((t) => (
          <TodoComponent key={t._id} item={t} listName={list} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    paddingTop: 8,
  },
  addLabel: { fontWeight: "bold", alignSelf: "flex-start", color: "#555" },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#aaaaaa",
    padding: 8,
    backgroundColor: "#ffffff90",
    borderRadius: 4,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    paddingHorizontal: 12,
    marginLeft: 8,
    borderRadius: 4,
    backgroundColor: "#314797",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
  },
});
