import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";

/**
 * Salvează userId-ul local pentru a-l putea folosi și după un restart al aplicației
 */
export const saveUserIdLocally = async (userId: string) => {
  try {
    await AsyncStorage.setItem("userId", userId);
  } catch (err) {
    console.log("⚠️ Eroare la salvarea userId în AsyncStorage:", err);
  }
};

/**
 * Obține URI-ul complet pentru utilizatorul curent din Firebase
 */
export const getUserUri = async (): Promise<string | null> => {
  try {
    // 1️⃣ Încearcă să obțină userId-ul din AsyncStorage
    let userId = await AsyncStorage.getItem("userId");

    // 2️⃣ Dacă nu e salvat local, verifică Clerk (la runtime)
    // 🧠 NOTĂ: nu putem folosi direct useUser() aici, deci
    // userId trebuie salvat când utilizatorul se loghează (vezi mai jos)
    if (!userId) {
      console.log("⚠️ Nu există userId local — utilizator neautentificat?");
      return null;
    }

    // 3️⃣ Returnează URL-ul pentru acel utilizator
    return `https://react-native-expenses-co-44802-default-rtdb.europe-west1.firebasedatabase.app/liste/liste-user_${userId}`;
  } catch (err) {
    console.log("⚠️ Eroare la getUserUri:", err);
    return null;
  }
};
