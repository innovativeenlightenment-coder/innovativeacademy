/* =========================================================
   LEARNING SKILLS
   Single source of truth for the entire application.

   Used by:
   - Teacher Question Bank
   - Question Builder
   - AI Skill Suggestions
   - Question Attempts
   - Student Skill Analytics
   - MongoDB Schema Validation
========================================================= */

/* =========================================================
   TYPES
========================================================= */

export type LearningSkillId =
  (typeof LEARNING_SKILL_GROUPS)[number]["skills"][number]["id"];

export type LearningSkill = {
  readonly id: LearningSkillId;
  readonly label: string;
};

export type LearningSkillGroup = {
  readonly category: string;
  readonly skills: readonly LearningSkill[];
};

/* =========================================================
   SKILL GROUPS
========================================================= */

export const LEARNING_SKILL_GROUPS = [
  {
    category: "Knowledge",
    skills: [
      { id: "recall", label: "Recall facts and information" },
      { id: "conceptual_understanding", label: "Understand concepts" },
      { id: "comparison", label: "Compare and differentiate" },
    ],
  },
  {
    category: "Application",
    skills: [
      { id: "formula_application", label: "Apply formulas and rules" },
      { id: "calculation", label: "Perform calculations" },
      { id: "problem_solving", label: "Solve problems" },
    ],
  },
  {
    category: "Reasoning",
    skills: [
      { id: "logical_reasoning", label: "Logical reasoning" },
      { id: "analytical_thinking", label: "Analyse and interpret information" },
      { id: "error_identification", label: "Identify errors" },
    ],
  },
  {
    category: "Data & Basic Skills",
    skills: [
      { id: "data_interpretation", label: "Read and interpret data" },
      { id: "basic_reference", label: "Use tables, charts and reference information" },
      { id: "scientific_investigation", label: "Interpret experiments and evidence" },
    ],
  },
] as const;

/* =========================================================
   FLATTENED SKILL LIST
========================================================= */

// All skills in one array for dropdowns and Autocomplete.

export const LEARNING_SKILLS: LearningSkill[] = [];

for (const group of LEARNING_SKILL_GROUPS) {
  for (const skill of group.skills) {
    LEARNING_SKILLS.push(skill);
  }
}

/* =========================================================
   SKILL IDS
========================================================= */

// Only IDs, useful for MongoDB enum validation.

export const LEARNING_SKILL_IDS = LEARNING_SKILLS.map(
  (skill) => skill.id
);

/* =========================================================
   SKILL LABEL MAP
========================================================= */

// Quickly convert a skill ID into its readable label.

export const LEARNING_SKILL_LABELS = Object.fromEntries(
  LEARNING_SKILLS.map((skill) => [skill.id, skill.label])
) as Record<LearningSkillId, string>;

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

/**
 * Get the display label of a skill ID.
 *
 * Example:
 * getLearningSkillLabel("formula_application")
 * Returns: "Apply formulas"
 */
export function getLearningSkillLabel(
  skillId: string
): string {
  return (
    LEARNING_SKILL_LABELS[skillId as LearningSkillId] ??
    skillId
  );
}

/**
 * Check whether a string is a valid learning skill ID.
 */
export function isLearningSkillId(
  skillId: string
): skillId is LearningSkillId {
  return LEARNING_SKILLS.some(
    (skill) => skill.id === skillId
  );
}

/**
 * Get all skills belonging to a category.
 */
export function getLearningSkillsByCategory(
  category: string
): readonly LearningSkill[] {
  return (
    LEARNING_SKILL_GROUPS.find(
      (group) => group.category === category
    )?.skills ?? []
  );
}

/**
 * Get a skill object using its ID.
 */
export function getLearningSkill(
  skillId: string
): LearningSkill | undefined {
  return LEARNING_SKILLS.find(
    (skill) => skill.id === skillId
  );
}