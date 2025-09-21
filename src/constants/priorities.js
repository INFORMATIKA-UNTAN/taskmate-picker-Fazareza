export const PRIORITY_META = [
  { key: "High", color: "#ef4444", weight: 3 },

  { key: "Medium", color: "#f59e0b", weight: 2 },

  { key: "Low", color: "#64748b", weight: 1 },
];

// [BARU] Daftar label (untuk Picker/Chip)
export const PRIORITIES = PRIORITY_META.map((p) => p.key);

// [BARU] Ambil warna prioritas
export function colorOfPriority(name) {
  const f = PRIORITY_META.find((p) => p.key === name);

  return f ? f.color : "#64748b";
}

// [BARU] Ambil bobot untuk sorting (High > Medium > Low)
export function weightOfPriority(name) {
  const f = PRIORITY_META.find((p) => p.key === name);
  return f ? f.weight : 1;
}
