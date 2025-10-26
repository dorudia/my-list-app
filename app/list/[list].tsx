import NotificatinoButton from "@/components/NotificatinoButton";
import TodoComponent from "@/components/todo";
import UserContainer from "@/components/UserContainer";
import { useTodos } from "@/store/todo-context";
// import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  // const [todos, setTodos] = useState<Todos>([]);
  const { todos, updateTodo, addTodo, fetchTodos, deleteTodos } = useTodos();
  const [todo, setTodo] = useState("");
  const router = useRouter();
  const navigation = useNavigation();
  const { bgColor } = useTodos();
  const [isLoading, setIsLoading] = useState(false);
  const { list } = useLocalSearchParams<{ list: string }>();

  // const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const capitalizeWords = (str: string) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: capitalizeWords(list),
      headerRight: () => <NotificatinoButton />,
      headerStyle: {
        backgroundColor: bgColor,
      },
      contentStyle: {
        backgroundColor: bgColor,
      },
    });
  }, [navigation, bgColor]);

  const submitHandler = async () => {
    if (todo.trim() === "") {
      Alert.alert("Error", "Name cannot be empty!");
      return;
    }

    for (const item of todos) {
      if (item.text === todo.trim()) {
        Alert.alert("Error", "Name already exists!");
        return;
      }
    }

    console.log("todo:", todo);
    await addTodo(todo, list);
    setTodo("");
    await fetchTodos(list);
  };

  const onInputChange = (text: string) => {
    setTodo(text);
  };

  const deleteTodosHandler = () => {
    Alert.alert("Delete All", "Are you sure you want to delete all todos?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => deleteTodos(list),
      },
    ]);
  };

  useEffect(() => {
    fetchTodos(list);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const updateRninderFalseForMissedNotifications = async () => {
      const now = new Date();
      const missed = todos.filter(
        (n) => n.reminder && n.reminderDate && new Date(n.reminderDate) < now
      );
      console.log("👍 am gasit ", missed.length, " todos trecute");

      for (const n of missed) {
        try {
          await updateTodo({
            id: n.id,
            listName: n.listName,
            text: n.text,
            reminder: false,
            reminderDate: null,
          });
        } catch (error) {
          console.log("UpdateTodo in list error:", error);
        }
      }

      setIsLoading(false);
    };
    updateRninderFalseForMissedNotifications();
  }, [todos]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={"#555"} />
      </View>
    );
  }

  return (
    <>
      {/* <SafeAreaView style={{ flex: 1 }}> */}
      <View style={styles.rootContainer}>
        <UserContainer />
        <Text
          style={{
            fontWeight: "bold",
            alignSelf: "flex-start",
            color: "#555",
          }}
        >
          Add new Todo
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            value={todo}
            onChangeText={onInputChange}
            style={styles.input}
            placeholder="add todo"
            returnKeyType="done"
            onSubmitEditing={submitHandler}
            // multiline={true}
          />
          <Pressable style={styles.button} onPress={submitHandler}>
            <Text style={styles.buttonText}>add</Text>
          </Pressable>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          style={{
            width: "100%",
            marginTop: 10,
            // padding: 10,
            marginBottom: 50,
            // backgroundColor: "#faaaaa",
          }}
        >
          {todos.map((todo) => (
            <TodoComponent key={todo.id} item={todo} listName={list} />
          ))}
        </ScrollView>
      </View>
      {/* </SafeAreaView> */}
    </>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    // backgroundColor: "#ffffff",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#555",
  },
  inputContainer: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    // width: "100%",
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#aaaaaa",
    padding: 8,
  },
  button: {
    // width: "25%",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    paddingHorizontal: 12,
    marginLeft: 8,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "#314797",
  },
  list: {
    width: "100%",
    backgroundColor: "#b3a5a5",
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "red",
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
    // fontFamily: "Inter_500Medium",
  },
  checkBox: {
    marginLeft: 10,
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: "#3a8e3d",
    borderRadius: 5,
  },
  checked: {
    backgroundColor: "#3a8e3d",
  },
});
