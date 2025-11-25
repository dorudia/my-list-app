import NotificatinoButton from "@/components/NotificatinoButton";
import UserContainer from "@/components/UserContainer";
import { useTodos, UserList } from "@/store/todo-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";

const AddList = () => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();
  const navigation = useNavigation();
  const { getUserLists, addList, userLists, deleteList, bgColor } = useTodos();
  const { isLoaded, isSignedIn } = useUser();
  const user = useUser().user;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <NotificatinoButton />,
      headerStyle: { backgroundColor: bgColor },
      contentStyle: { backgroundColor: bgColor },
    });
  }, [navigation, bgColor]);

  const onInputChange = (text: string) => setInput(text);

  const deleteListHandler = (id: string, name: string) => {
    Alert.alert(
      "Delete List",
      `Are you sure you want to delete the "${name.toUpperCase()}" list?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => deleteList(id) },
      ]
    );
  };

  const submitHandler = async () => {
    await addList(input);
    setInput("");
  };

  useEffect(() => {
    if (isLoaded && user) getUserLists();
  }, [isLoaded, user]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <View style={styles.rootContainer}>
      <UserContainer />
      <Text style={styles.title}>Add new List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={onInputChange}
          style={styles.input}
          placeholder="Add new list"
          returnKeyType="done"
          onSubmitEditing={submitHandler}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={submitHandler}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.listsWrapper}
        contentContainerStyle={{ paddingBottom: 70 }}
        showsVerticalScrollIndicator={false}
      >
        {[...userLists].reverse().map((list) => (
          <TouchableOpacity
            key={list._id}
            style={styles.listContainer}
            onPress={() => router.push(`/list/${list.name}`)}
          >
            <Text style={styles.listText}>{list.name}</Text>
            <MaterialCommunityIcons
              name="delete-outline"
              size={24}
              color="red"
              onPress={() => deleteListHandler(list._id, list.name)}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default AddList;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "flex-start",
    color: "#555",
    marginBottom: 8,
  },
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
  listsWrapper: {
    width: "100%",
    padding: 8,
  },
  listContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#aaaaaa",
    padding: 6,
    borderRadius: 12,
    backgroundColor: "#ffffff80",
  },
  listText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    textTransform: "capitalize",
  },
});
