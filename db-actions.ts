const uri =
  "https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/todos.json";

export const addTodo = async (text: string) => {
  await fetch(uri, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
};

export const getTodos = async () => {
  const response = await fetch(uri);
  const data = await response.json();
  console.log(data);
  return data;
};
