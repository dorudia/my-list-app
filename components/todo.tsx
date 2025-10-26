import { Todo } from "@/models";
import { useTodos } from "@/store/todo-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
// type TodoItem = {
//   id: string;
//   text: string;
//   completed: boolean;
// };
const TodoComponent = ({
  item,
  listName,
}: {
  item: Todo;
  listName: string;
}) => {
  const { todos, updateTodo, deleteTodo } = useTodos();
  const todo = todos.find((todo) => todo.id === item.id);
  const [isChecked, setIsChecked] = useState(todo?.completed || false);
  const { deleteTodos } = useTodos();
  const router = useRouter();

  const onPressTodoHandler = (todo: Todo) => {
    router.push({
      pathname: "/id/[id]",
      params: { id: todo.id, listName: listName },
    });
  };

  const checkBoxHandler = () => {
    setIsChecked(!isChecked);
    updateTodo({
      id: item.id,
      listName,
      completed: !isChecked,
    });
  };

  const deleteHandler = () => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTodo(todo?.id || "", listName),
      },
    ]);
  };

  return (
    <Pressable
      onPress={() => onPressTodoHandler(item)}
      style={{
        flex: 1,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderColor: "#c2c2c2",
        padding: 8,
        // marginBottom: 8,
        borderRadius: 8,
        // elevation: 4,
        overflow: "hidden",
        // backgroundColor: "#fdfdfd",
      }}
    >
      <Text
        style={{
          fontSize: 18,
          textTransform: "capitalize",
          color: isChecked ? "#808080" : "#081c66",
          textDecorationLine: isChecked ? "line-through" : "none",
          maxWidth: "70%",
          fontFamily: "Intre_500Medium",
        }}
      >
        {item.text}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={checkBoxHandler}>
          <View style={[styles.checkBox, isChecked && styles.checked]}>
            {isChecked && <Ionicons name="checkmark" size={20} color="#fff" />}
          </View>
        </Pressable>
        <MaterialCommunityIcons
          name="delete-outline"
          size={30}
          color="#dc3131"
          onPress={deleteHandler}
        />
      </View>

      {todo?.reminder && (
        <Ionicons
          name="notifications-outline"
          style={styles.notificationsIcon}
          size={16}
          color="#cf1010"
        />
      )}
    </Pressable>
  );
};

export default TodoComponent;

const styles = StyleSheet.create({
  checkBox: {
    marginRight: 20,
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: "#314797",
    borderRadius: 5,
  },
  checked: {
    backgroundColor: "#6783e9",
  },
  notificationsIcon: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
