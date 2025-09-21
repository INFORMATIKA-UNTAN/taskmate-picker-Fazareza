import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";

// Warna prioritas
const priorityColors = {
  High: "#fda4af", // merah muda
  Medium: "#fef08a", // kuning muda
  Low: "#e2e8f0", // abu muda
};

// Warna kategori
const categoryColors = {
  Mobile: "#38bdf8", // biru
  RPL: "#4ade80", // hijau
  IoT: "#facc15", // kuning
  Umum: "#94a3b8", // abu default
};

export default function TaskItem({ task, onToggle, onDelete }) {
  const isDone = task.status === "done";

  // ambil warna kategori & prioritas
  const catColor = categoryColors[task.category] || categoryColors["Umum"];
  const prioColor = priorityColors[task.priority] || priorityColors["Low"];

  // cek deadline
  let deadlineText = "";
  if (task.deadline) {
    const today = new Date();
    const due = new Date(task.deadline);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) {
      deadlineText = "Overdue";
    } else {
      deadlineText = `Sisa ${diff} hari`;
    }
  }

  // progress bar
  const pct =
    typeof task.progress === "number"
      ? Math.max(0, Math.min(100, task.progress))
      : null;

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      {/* Klik untuk toggle */}
      <TouchableOpacity
        onPress={() => onToggle?.(task)}
        activeOpacity={0.7}
        style={{ flex: 1 }}
      >
        <Text style={[styles.title, isDone && styles.strike]}>
          {task.title}
        </Text>

        {!!task.description && (
          <Text style={styles.desc}>{task.description}</Text>
        )}

        {!!task.deadline && (
          <Text
            style={[
              styles.deadline,
              deadlineText === "Overdue" && { color: "red" },
            ]}
          >
            {deadlineText}
          </Text>
        )}

        {/* Badge kategori & prioritas */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
          <View
            style={[
              styles.badge,
              { borderColor: catColor, backgroundColor: `${catColor}20` },
            ]}
          >
            <Text style={[styles.badgeText, { color: catColor }]}>
              {task.category || "Umum"}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              { borderColor: prioColor, backgroundColor: `${prioColor}40` },
            ]}
          >
            <Text style={[styles.badgeText, { color: prioColor }]}>
              {task.priority || "Low"}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              task.status === "todo" && styles.badgeTodo,
              task.status === "pending" && styles.badgePending,
              task.status === "done" && styles.badgeDone,
            ]}
          >
            <Text style={styles.badgeStatus}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        {pct !== null && (
          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, { width: `${pct}%` }]} />
            <Text style={styles.progressText}>{pct}%</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Tombol hapus di luar Touchable */}
      <Pressable onPress={() => onDelete?.(task)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardDone: { backgroundColor: "#f8fafc" },
  title: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  strike: { textDecorationLine: "line-through", color: "#64748b" },
  desc: { fontSize: 14, color: "#475569", marginTop: 2 },
  deadline: { fontSize: 12, color: "#334155", marginTop: 2 },

  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  badgeStatus: { fontSize: 12, fontWeight: "600", color: "white" },
  badgeTodo: { backgroundColor: "#38bdf8", borderColor: "#38bdf8" },
  badgePending: { backgroundColor: "#facc15", borderColor: "#facc15" },
  badgeDone: { backgroundColor: "#22c55e", borderColor: "#22c55e" },

  progressWrap: {
    marginTop: 10,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: { height: "100%", backgroundColor: "#0f172a" },
  progressText: {
    position: "absolute",
    right: 8,
    top: -18,
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },

  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#ef4444",
    marginLeft: 8,
  },
  deleteText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },
});
