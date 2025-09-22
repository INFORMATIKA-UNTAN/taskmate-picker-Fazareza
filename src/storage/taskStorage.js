// Import AsyncStorage dari library resmi
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

// Key untuk menyimpan data di AsyncStorage
const STORAGE_KEY = "TASKMATE_TASKS";

// Simpan array tugas ke AsyncStorage
export async function saveTasks(tasks) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Gagal menyimpan:", e);
  }
}
// Load array tugas dari AsyncStorage
export async function loadTasks() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];

    let tasks = JSON.parse(json);

    // 🔧 Migration: kasih id jika kosong & paksa jadi string
    let fixed = false;
    tasks = tasks.map((t) => {
      if (!t.id) {
        fixed = true;
        return { ...t, id: uuidv4() };
      }
      if (typeof t.id !== "string") {
        fixed = true;
        return { ...t, id: String(t.id) };
      }
      return t;
    });

    // kalau ada yang diperbaiki, simpan lagi
    if (fixed) {
      await saveTasks(tasks);
    }

    return tasks;
  } catch (e) {
    console.error("Gagal membaca:", e);
    return [];
  }
}

// Clear semua task
export async function clearTasks() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Gagal clear:", e);
  }
}
