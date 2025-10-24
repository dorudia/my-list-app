import NotificatinoButton from "@/components/NotificatinoButton";
import TodoComponent from "@/components/todo";
import UserContainer from "@/components/UserContainer";
import { useTodos } from "@/store/todo-context";
// import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
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

  const { list } = useLocalSearchParams<{ list: string }>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: list,
      headerRight: () => <NotificatinoButton />,
    });
  }, [navigation]);

  const submitHandler = async () => {
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
    // width: "60%",
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
