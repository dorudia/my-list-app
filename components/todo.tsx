// import { Todo } from "@/models";
// import { useTodos } from "@/store/todo-context";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import { useRouter } from "expo-router";
// import React, { useState } from "react";
// import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

// const TodoComponent = ({
//   item,
//   listName,
// }: {
//   item: Todo;
//   listName: string;
// }) => {
//   const { todos, updateTodo, deleteTodo } = useTodos();
//   const todo = todos.find((todo) => todo.userId === item.userId);
//   const [isChecked, setIsChecked] = useState(todo?.completed || false);
//   const { deleteTodos } = useTodos();
//   const router = useRouter();

//   const onPressTodoHandler = (todo: Todo) => {
//     router.push({
//       pathname: "/id/[id]",
//       params: { id: todo.userId, listName: listName },
//     });
//   };

//   const checkBoxHandler = () => {
//     setIsChecked(!isChecked);
//     updateTodo({
//       id: item.userId,
//       listName,
//       completed: !isChecked,
//     });
//   };

//   const deleteHandler = () => {
//     Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
//       {
//         text: "Cancel",
//         style: "cancel",
//       },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: () => deleteTodo(todo?.userId || "", listName),
//       },
//     ]);
//   };

//   return (
//     <Pressable
//       onPress={() => onPressTodoHandler(item)}
//       style={{
//         flex: 1,
//         width: "100%",
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//         borderBottomWidth: 1,
//         borderColor: "#c2c2c2",
//         padding: 8,
//         // marginBottom: 8,
//         borderRadius: 8,
//         // elevation: 4,
//         overflow: "hidden",
//         // backgroundColor: "#fdfdfd",
//       }}
//     >
//       <Text
//         style={{
//           fontSize: 18,
//           textTransform: "capitalize",
//           color: isChecked ? "#808080" : "#081c66",
//           textDecorationLine: isChecked ? "line-through" : "none",
//           maxWidth: "70%",
//           fontFamily: "Intre_500Medium",
//         }}
//       >
//         {item.text}
//       </Text>

//       <View style={{ flexDirection: "row", alignItems: "center" }}>
//         <Pressable onPress={checkBoxHandler}>
//           <View style={[styles.checkBox, isChecked && styles.checked]}>
//             {isChecked && <Ionicons name="checkmark" size={20} color="#fff" />}
//           </View>
//         </Pressable>
//         <MaterialCommunityIcons
//           name="delete-outline"
//           size={30}
//           color="#dc3131"
//           onPress={deleteHandler}
//         />
//       </View>

//       {todo?.reminder && (
//         <Ionicons
//           name="notifications-outline"
//           style={styles.notificationsIcon}
//           size={16}
//           color="#cf1010"
//         />
//       )}
//     </Pressable>
//   );
// };

// export default TodoComponent;

// const styles = StyleSheet.create({
//   checkBox: {
//     marginRight: 20,
//     width: 25,
//     height: 25,
//     borderWidth: 2,
//     borderColor: "#314797",
//     borderRadius: 5,
//   },
//   checked: {
//     backgroundColor: "#6783e9",
//   },
//   notificationsIcon: {
//     position: "absolute",
//     left: 0,
//     top: 0,
//   },
// });

//-----------------------------====================================---------------------------

import { Todo, useTodos } from "@/store/todo-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

interface TodoComponentProps {
  item: Todo;
  listName: string;
}

const TodoComponent: React.FC<TodoComponentProps> = ({ item, listName }) => {
  const { updateTodo, deleteTodo } = useTodos();
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(item.completed);

  // Navigare la pagina de edit
  const onPressTodoHandler = () => {
    router.push({
      pathname: "/id/[id]",
      params: { id: item._id, listName },
    });
  };

  // Toggle completare
  const checkBoxHandler = async () => {
    const newCompleted = !isChecked;
    setIsChecked(newCompleted);
    await updateTodo({
      _id: item._id,
      listName,
      completed: newCompleted,
      text: item.text,
      reminder: item.reminder,
      reminderDate: item.reminderDate,
    });
  };

  // Delete single todo
  const deleteHandler = () => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTodo(item._id, listName);
        },
      },
    ]);
  };

  return (
    <Pressable onPress={onPressTodoHandler} style={styles.container}>
      <Text
        adjustsFontSizeToFit
        style={[styles.text, isChecked && styles.textCompleted]}
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

      {item.reminder && (
        <Ionicons
          name="notifications-outline"
          style={styles.notificationIcon}
          size={16}
          color="#cf1010"
        />
      )}

      {item.link && (
        <Ionicons
          name="link-outline"
          style={styles.linkIcon}
          size={16}
          color="#0066cc"
        />
      )}

      {item.phone && (
        <Ionicons
          name="call-outline"
          style={styles.phoneIcon}
          size={16}
          color="#28a745"
        />
      )}
    </Pressable>
  );
};

export default TodoComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#c2c2c2",
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 18,
    color: "#081c66",
    maxWidth: "70%",
  },
  textCompleted: {
    color: "#808080",
    textDecorationLine: "line-through",
  },
  checkBox: {
    marginRight: 20,
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: "#314797",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    backgroundColor: "#6783e9",
  },
  notificationIcon: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  linkIcon: {
    position: "absolute",
    left: 20,
    top: 0,
  },
  phoneIcon: {
    position: "absolute",
    left: 40,
    top: 0,
  },
});

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Pressable,
// } from "react-native";
// import { useTodos } from "@/store/todo-context";
// import { Todo } from "@/store/todo-context";
// import { useRouter } from "expo-router";

// export default function TodoComponent({
//   item,
//   listName,
// }: {
//   item: Todo;
//   listName: string;
// }) {
//   const { updateTodo, deleteTodo } = useTodos();
//   const [text, setText] = useState(item.text);
//   const router = useRouter();

//   // sincronizare cu props.item
//   useEffect(() => {
//     setText(item.text);
//   }, [item.text]);

//   const saveChanges = () => {
//     updateTodo({ _id: item._id, listName, text });
//   };

//   const removeTodo = () => {
//     deleteTodo(item._id, listName);
//   };

//   const onPressTodoHandler = () => {
//     router.push({
//       pathname: "/id/[id]",
//       params: { id: item._id, listName },
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput
//         value={text}
//         onChangeText={setText}
//         style={styles.input}
//         onBlur={saveChanges}
//       />
//       <TouchableOpacity onPress={removeTodo} style={styles.delete}>
//         <Text>Delete</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#aaa",
//     padding: 8,
//     borderRadius: 4,
//   },
//   delete: {
//     marginLeft: 8,
//     padding: 8,
//     backgroundColor: "#f55",
//     borderRadius: 4,
//   },
// });
