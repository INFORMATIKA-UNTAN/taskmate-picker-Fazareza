import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";

export default function AddCategoryModal({
  visible,
  onClose,
  onSubmit,
  suggestedColor,
}) {
  // state input nama kategori
  const [name, setName] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      // validasi: jangan izinkan nama kosong
      Alert.alert("Validasi", "Nama kategori tidak boleh kosong.");
      return;
    }
    // kembalikan ke parent, bawa warna yang disarankan
    onSubmit?.({ key: trimmed, color: suggestedColor });
    setName("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Tambah Kategori Baru</Text>

          {/* Input nama kategori */}
          <TextInput
            placeholder="mis. Basis Data"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          {/* Aksi: Batal / Simpan */}
          <View
            style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}
          >
            <Button title="Batal" onPress={onClose} />
            <Button title="Simpan" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
  },
});
