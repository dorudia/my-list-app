import NotificatinoButton from "@/components/NotificatinoButton";
import UserContainer from "@/components/UserContainer";
import { useTodos } from "@/store/todo-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AddList = () => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();
  const { getUserLists, addList, userLists, deleteList, updateTodo } =
    useTodos();
  const navigation = useNavigation();
  const { bgColor } = useTodos();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <NotificatinoButton />,
      headerStyle: {
        backgroundColor: bgColor,
      },
      contentStyle: {
        backgroundColor: bgColor,
      },
    });
  }, [navigation, bgColor]);

  const onInputChange = (text: string) => {
    setInput(text);
  };

  const deleteListHandler = (listName: string) => {
    Alert.alert("Delete List", "Are you sure you want to delete this list?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => deleteList(listName),
      },
    ]);
  };

  const submitHandler = async () => {
    await addList(input);
    setInput("");
  };

  useEffect(() => {
    async function getList() {
      await getUserLists();
    }
    getList();
  }, []);

  return (
    // <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.rootContainer}>
      <UserContainer />
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          alignSelf: "flex-start",
          color: "#555",
        }}
      >
        Add new List
      </Text>
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
          // multiline={true}
        />
        <Pressable style={styles.button} onPress={submitHandler}>
          <Text style={styles.buttonText}>add</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.listsWrapper}
        contentContainerStyle={{ paddingBottom: 70 }}
        showsVerticalScrollIndicator={false}
      >
        {userLists.map((list) => (
          <TouchableOpacity
            onPress={() => {
              router.push(`/list/${list}`);
            }}
            key={list}
            style={styles.listContainer}
          >
            <Text style={styles.listText}>{list}</Text>
            <MaterialCommunityIcons
              name="delete-outline"
              size={24}
              color="red"
              onPress={() => deleteListHandler(list)}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
    // </SafeAreaView>
  );
};

export default AddList;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    // backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    // marginTop: -50,
    // width: Platform.OS === "web" ? "50%" : "100%",
    // marginHorizontal: Platform.OS === "web" ? "auto" : undefined,
  },
  listsWrapper: {
    width: "100%",
    padding: 8,
  },
  listContainer: {
    width: "100%",
    flex: 1,
    // height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#aaaaaa",
    padding: 6,
    borderRadius: 12,
    backgroundColor: "#ffffff80",
    // elevation: 4,
  },
  listText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter_500Medium",
    color: "#555",
    textTransform: "capitalize",
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
    marginBottom: 12,
  },
  input: {
    // width: "60%",
    flex: 1,
    // height: 40,
    borderWidth: 1,
    borderColor: "#aaaaaa",
    padding: 8,
    backgroundColor: "#ffffff90",
    borderRadius: 4,
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
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
    fontFamily: "Inter_500Medium",
  },
});
