import { useEffect, useState, useMemo } from "react";
import {
  SafeAreaView,
  Text,
  SectionList,
  StyleSheet,
  View,
  Button,
} from "react-native";
import TaskItem from "../src/components/TaskItem";
import FilterToolbarFancy from "../src/components/FilterToolbarFancy";
import AddCategoryModal from "../src/components/AddCategoryModal";
import { loadTasks, saveTasks, clearTasks } from "../src/storage/taskStorage";
import { loadCategories, saveCategories } from "../src/storage/categoryStorage";
import { pickColor } from "../src/constants/categories";
import { weightOfPriority } from "../src/constants/priorities";
import { dummyTasks } from "../src/data/dummyTasks";
import { v4 as uuidv4 } from "uuid";
import alert from "@/alert";

export default function Home() {
  // [STATE] data
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  // [STATE] filter
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'todo' | 'done'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all"); // 'all' | 'Low' | 'Medium' | 'High'

  // [STATE] modal tambah kategori
  const [showCatModal, setShowCatModal] = useState(false);

  // [INIT] Muat data
  useEffect(() => {
    (async () => {
      let loaded = await loadTasks();

      // kalau kosong → isi dummy sekali saja
      if (!loaded || loaded.length === 0) {
        // kasih id string pasti
        const withIds = dummyTasks.map((t) => ({
          ...t,
          id: String(t.id) || uuidv4(),
        }));
        await saveTasks(withIds);
        loaded = withIds;
      }

      // normalisasi id biar selalu string unik
      loaded = loaded.map((t) => ({ ...t, id: String(t.id) }));

      setTasks(loaded);
      setCategories(await loadCategories());
    })();
  }, []);

  // [AKSI] Toggle status Done/Pending
  const handleToggle = async (task) => {
    const updated = tasks.map((t) =>
      t.id === task.id
        ? { ...t, status: t.status === "done" ? "pending" : "done" }
        : t
    );
    setTasks(updated);
    await saveTasks(updated);
  };

  // [AKSI] Hapus 1 tugas
  const handleDelete = async (task) => {
    alert("Konfirmasi", "Hapus tugas ini?", [
      { text: "Batal" },
      {
        text: "Ya",
        onPress: async () => {
          const updated = tasks.filter((t) => t.id !== task.id);
          setTasks(updated);
          await saveTasks(updated);
        },
      },
    ]);
  };

  // [INFO] Toolbar
  const doneCount = useMemo(
    () => tasks.filter((t) => t.status === "done").length,
    [tasks]
  );
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const overdueCount = useMemo(
    () =>
      tasks.filter(
        (t) => t.deadline && t.deadline < today && t.status !== "done"
      ).length,
    [tasks, today]
  );

  // [AKSI] Clear
  const handleClearDone = () => {
    if (!doneCount) {
      alert("Info", "Tidak ada tugas Done.");
      return;
    }
    alert("Hapus Tugas Selesai", `Yakin hapus ${doneCount} tugas selesai?`, [
      { text: "Batal" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const kept = tasks.filter((t) => t.status !== "done");
          setTasks(kept);
          await saveTasks(kept);
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (!tasks.length) {
      alert("Info", "Daftar tugas kosong.");
      return;
    }
    alert("Konfirmasi", "Hapus semua tugas?", [
      { text: "Batal" },
      {
        text: "Ya",
        onPress: async () => {
          setTasks([]);
          await clearTasks();
        },
      },
    ]);
  };

  // [FILTER]
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const byStatus =
        statusFilter === "all" ||
        (statusFilter === "todo" ? t.status !== "done" : t.status === "done");

      const byCategory =
        categoryFilter === "all" || (t.category ?? "Umum") === categoryFilter;

      const byPriority =
        priorityFilter === "all" || (t.priority ?? "Low") === priorityFilter;

      return byStatus && byCategory && byPriority;
    });
  }, [tasks, statusFilter, categoryFilter, priorityFilter]);

  // [SORT]
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const wa = weightOfPriority(a.priority ?? "Low");
      const wb = weightOfPriority(b.priority ?? "Low");
      if (wa !== wb) return wb - wa;
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }, [filteredTasks]);

  // [GROUPING] by kategori
  const groupedTasks = useMemo(() => {
    const groups = {};
    sortedTasks.forEach((task) => {
      const cat = task.category || "Umum";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(task);
    });
    return Object.keys(groups).map((key) => ({
      title: key,
      data: groups[key],
    }));
  }, [sortedTasks]);

  // [OPSIONAL] tambah kategori
  const handleSubmitCategory = async (cat) => {
    if (categories.some((c) => c.key.toLowerCase() === cat.key.toLowerCase())) {
      Alert.alert("Info", "Nama kategori sudah ada.");
      setShowCatModal(false);
      return;
    }
    const color = cat.color || pickColor(categories.length);
    const next = [...categories, { key: cat.key, color }];
    setCategories(next);
    await saveCategories(next);
    setCategoryFilter(cat.key);
    setShowCatModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>TaskMate – Daftar Tugas</Text>

      {/* Toolbar filter */}
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <FilterToolbarFancy
          categories={categories}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        {/* Toolbar ringkasan */}
        <View style={styles.toolbar}>
          <Text style={styles.toolbarText}>
            Done: {doneCount} / {tasks.length}
          </Text>
          <Text
            style={[
              styles.toolbarText,
              { color: overdueCount ? "#dc2626" : "#334155" },
            ]}
          >
            Overdue: {overdueCount}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              title="Clear Done"
              onPress={handleClearDone}
              disabled={!doneCount}
            />
            <Button title="Clear All" onPress={handleClearAll} />
          </View>
        </View>
      </View>

      {/* LIST grouped by kategori */}
      <SectionList
        sections={groupedTasks}
        keyExtractor={(item) => item.id} // pakai id saja, jangan index
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            categories={categories}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center" }}>Tidak ada tugas</Text>
        }
      />

      {/* Modal tambah kategori */}
      <AddCategoryModal
        visible={showCatModal}
        onClose={() => setShowCatModal(false)}
        onSubmit={handleSubmitCategory}
        suggestedColor={pickColor(categories.length)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { fontSize: 20, fontWeight: "700", padding: 16 },
  toolbar: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 8,
    gap: 8,
  },
  toolbarText: { fontWeight: "600", color: "#334155" },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    color: "#1e293b",
  },
});
