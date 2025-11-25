import NotificatinoButton from "@/components/NotificatinoButton";
import { useNotifications } from "@/store/notification-context";
import { useTodos } from "@/store/todo-context";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Todo = () => {
  const { todos, updateTodo } = useTodos();
  const { notifications, createNotification } = useNotifications();
  const { id, listName } = useLocalSearchParams<{
    id: string;
    listName: string;
  }>();
  const todo = todos.find((todo) => todo._id === id);

  const notification = notifications.find(
    (notification) => notification._id === id
  );
  const [inputValue, setInputValue] = useState(todo?.text || "");
  const [isChecked, setIsChecked] = useState(todo?.completed || false);
  const router = useRouter();
  const { bgColor } = useTodos();
  const navigation = useNavigation();
  const [date, setDate] = useState<Date | undefined>(
    todo?.reminderDate && new Date(todo.reminderDate).getTime() > Date.now()
      ? new Date(todo.reminderDate)
      : undefined
  );

  const [showIOS, setShowIOS] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: "left",
      headerRight: () => <NotificatinoButton />,
      headerStyle: {
        backgroundColor: bgColor,
      },
      contentStyle: {
        backgroundColor: bgColor,
      },
    });
  }, [navigation, bgColor]);

  const showPicker = () => {
    if (Platform.OS === "android") {
      // Prima: selectează data
      DateTimePickerAndroid.open({
        value: date || new Date(),
        onChange: (event, selectedDate) => {
          if (!selectedDate) return;

          const pickedDate = selectedDate;

          // După ce selectează data → selectează ora
          DateTimePickerAndroid.open({
            value: date || new Date(),
            onChange: (event, selectedTime) => {
              if (!selectedTime) return;

              const finalDate = new Date(
                pickedDate.getFullYear(),
                pickedDate.getMonth(),
                pickedDate.getDate(),
                selectedTime.getHours(),
                selectedTime.getMinutes()
              );
              setDate(finalDate);
            },
            mode: "time",
            is24Hour: true,
            display: "spinner", // 👈 face pickerul de oră mai modern
          });
        },
        mode: "date",
        is24Hour: true,
        display: "calendar", // 👈 afișează calendarul normal pentru dată
      });
    } else {
      setShowIOS(true);
    }
  };

  const title = useRouter();

  const submitHandler = (text: string) => {
    if (inputValue.trim() === "") {
      Alert.alert("Error", "Name cannot be empty!", [
        { text: "ok", onPress: () => setInputValue(todo?.text || "") },
      ]);
      return;
    }
    for (const todo of todos) {
      if (todo.text === inputValue.trim() && todo._id !== id) {
        Alert.alert("Error", "Name already exists!", [
          { text: "ok", onPress: () => setInputValue(todo?.text || "") },
        ]);
        return;
      }
    }

    if (date && date < new Date()) {
      Alert.alert("Alert", "Notification cannot be in the past!", [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: () => setDate(undefined),
        },
      ]);
      return;
    }
    if (date) {
      const reminder = date > new Date();
      const updatedDate = date > new Date() ? date : undefined;
      updateTodo({
        _id: id,
        listName,
        text,
        completed: isChecked,
        reminder,
        reminderDate: updatedDate,
      });
      createNotification({
        listName,
        title: text,
        todoId: id,
        body: text,
        read: false,
        date: updatedDate?.toDateString(),
        delivered: false,
      });
    } else {
      updateTodo({ _id: id, listName, text });
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Edit Todo</Text> */}
      <View style={{ alignItems: "center", width: "100%" }}>
        <Text style={{ textAlign: "center", marginBottom: 8 }}>Edit text</Text>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          style={styles.input}
          placeholder="Edit List Item"
        />

        <View style={{ width: "100%" }}>
          {/* <Text style={styles.title}>Set Notification</Text> */}
          <Text style={{ textAlign: "center", marginBottom: 8 }}>
            Edit Reminder
          </Text>
          <TouchableOpacity onPress={showPicker} style={styles.dateContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="white"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.buttonText}>{"Set Reminder Date "}</Text>
            </View>
            {date && (
              <Text adjustsFontSizeToFit style={styles.date}>
                {new Intl.DateTimeFormat("ro-RO", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).format(date)}
              </Text>
            )}
          </TouchableOpacity>

          {Platform.OS === "web" && showIOS && (
            <input
              type="datetime-local"
              value={date ? date.toISOString().slice(0, 16) : ""}
              onChange={(e) => setDate(new Date(e.target.value))}
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid #ccc",
                marginTop: 16,
              }}
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => submitHandler(inputValue)}
          >
            <Text adjustsFontSizeToFit style={styles.buttonText}>
              Update
            </Text>
          </TouchableOpacity>

          {Platform.OS === "ios" && showIOS && (
            <DateTimePicker
              value={date || new Date()}
              mode="datetime"
              display="spinner"
              onChange={(event, selected) => {
                setShowIOS(false);
                if (selected) setDate(selected);
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default Todo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    // height: 40,
    width: "100%",
    fontSize: 20,
    borderWidth: 2,
    borderColor: "#bbbbbb",
    padding: 10,
    backgroundColor: "#ffffff80",
    marginBottom: 16,
    borderRadius: 8,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#136f0e",
    marginTop: 24,
    padding: 12,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 16,
    width: "100%",
    marginBottom: 40,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
  },
  dateContainer: {
    width: "100%",
    padding: 10,
    backgroundColor: "#2d8bbe",
    borderRadius: 4,
  },
  date: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#a4a4a4",
    marginTop: 12,
    color: "#333",
  },
});
