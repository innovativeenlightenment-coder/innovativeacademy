export const levelLabelMap: Record<string, string> = {
  easy: "Beginner",
  moderate: "Intermediate",
  difficult: "Advanced",
  extreme: "Expert",
};

export const getLevelLabel = (level?: string) =>
  levelLabelMap[level ?? "easy"] || "Beginner";