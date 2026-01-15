export type LevelConfig = {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
};

export const LEVELS: LevelConfig[] = [
  // 🟢 Early – Calm & Respectable
  { level: 1, name: "Steady Mind", minPoints: 0, maxPoints: 99 },
  { level: 2, name: "Focused Path", minPoints: 100, maxPoints: 219 },
  { level: 3, name: "Quiet Spark", minPoints: 220, maxPoints: 359 },
  { level: 4, name: "Rising Thought", minPoints: 360, maxPoints: 519 },
  { level: 5, name: "Clear Intent", minPoints: 520, maxPoints: 699 },
  { level: 6, name: "Sharp Eye", minPoints: 700, maxPoints: 899 },
  { level: 7, name: "Strong Will", minPoints: 900, maxPoints: 1119 },
  { level: 8, name: "Calm Force", minPoints: 1120, maxPoints: 1359 },
  { level: 9, name: "Deep Focus", minPoints: 1360, maxPoints: 1619 },
  { level: 10, name: "Solid Base", minPoints: 1620, maxPoints: 1899 },

  // 🔵 Growing – Momentum
  { level: 11, name: "Skill Builder", minPoints: 1900, maxPoints: 2199 },
  { level: 12, name: "Pattern Breaker", minPoints: 2200, maxPoints: 2519 },
  { level: 13, name: "Fast Thinker", minPoints: 2520, maxPoints: 2859 },
  { level: 14, name: "Problem Solver", minPoints: 2860, maxPoints: 3219 },
  { level: 15, name: "Concept Master", minPoints: 3220, maxPoints: 3599 },
  { level: 16, name: "Precision Mind", minPoints: 3600, maxPoints: 3999 },
  { level: 17, name: "Knowledge Driver", minPoints: 4000, maxPoints: 4419 },
  { level: 18, name: "Logical Force", minPoints: 4420, maxPoints: 4859 },
  { level: 19, name: "Sharp Strategist", minPoints: 4860, maxPoints: 5319 },
  { level: 20, name: "Mental Athlete", minPoints: 5320, maxPoints: 5799 },

  // 🟣 Advanced – Authority
  { level: 21, name: "Subject Commander", minPoints: 5800, maxPoints: 6299 },
  { level: 22, name: "Accuracy King", minPoints: 6300, maxPoints: 6819 },
  { level: 23, name: "Speed Controller", minPoints: 6820, maxPoints: 7359 },
  { level: 24, name: "Concept Dominator", minPoints: 7360, maxPoints: 7919 },
  { level: 25, name: "Mind Engineer", minPoints: 7920, maxPoints: 8499 },
  { level: 26, name: "Knowledge Warrior", minPoints: 8500, maxPoints: 9099 },
  { level: 27, name: "Strategic Leader", minPoints: 9100, maxPoints: 9719 },
  { level: 28, name: "Mental Powerhouse", minPoints: 9720, maxPoints: 10359 },
  { level: 29, name: "Elite Thinker", minPoints: 10360, maxPoints: 11019 },
  { level: 30, name: "Learning Champion", minPoints: 11020, maxPoints: 11699 },

  // 🟠 Expert – Mastery
  { level: 31, name: "Exam Predator", minPoints: 11700, maxPoints: 12419 },
  { level: 32, name: "Concept Hunter", minPoints: 12420, maxPoints: 13179 },
  { level: 33, name: "Tactical Genius", minPoints: 13180, maxPoints: 13979 },
  { level: 34, name: "Score Architect", minPoints: 13980, maxPoints: 14819 },
  { level: 35, name: "Master of Flow", minPoints: 14820, maxPoints: 15699 },
  { level: 36, name: "Pressure Breaker", minPoints: 15700, maxPoints: 16619 },
  { level: 37, name: "Peak Performer", minPoints: 16620, maxPoints: 17579 },
  { level: 38, name: "Elite Commander", minPoints: 17580, maxPoints: 18579 },
  { level: 39, name: "Supreme Mind", minPoints: 18580, maxPoints: 19619 },
  { level: 40, name: "Grand Master", minPoints: 19620, maxPoints: 20699 },

  // 🔴 Legendary – Unstoppable
  { level: 41, name: "Iron Mind", minPoints: 20700, maxPoints: 21799 },
  { level: 42, name: "Limit Breaker", minPoints: 21800, maxPoints: 22939 },
  { level: 43, name: "Unshakable", minPoints: 22940, maxPoints: 24119 },
  { level: 44, name: "Absolute Force", minPoints: 24120, maxPoints: 25339 },
  { level: 45, name: "Mental King", minPoints: 25340, maxPoints: 26599 },
  { level: 46, name: "Knowledge Emperor", minPoints: 26600, maxPoints: 27899 },
  { level: 47, name: "Supreme Ruler", minPoints: 27900, maxPoints: 29239 },
  { level: 48, name: "Unstoppable", minPoints: 29240, maxPoints: 30619 },
  { level: 49, name: "Immortal Mind", minPoints: 30620, maxPoints: 32039 },
  { level: 50, name: "Legend", minPoints: 32040, maxPoints: Infinity },
];
