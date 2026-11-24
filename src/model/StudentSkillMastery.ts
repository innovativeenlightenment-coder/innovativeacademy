import mongoose, { Schema, Model } from "mongoose";

/* =========================================================
   STUDENT SKILL MASTERY
========================================================= */

const StudentSkillMasterySchema = new Schema(
  {
    /* =====================================================
       STUDENT
    ===================================================== */

    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    /* =====================================================
       SKILL IDENTITY

       Skill IDs come from learningSkills.ts.
       No separate SkillBank collection is required.
    ===================================================== */

    skillId: {
      type: String,
      required: true,
    },

    /* =====================================================
       ACADEMIC MAPPING
    ===================================================== */

    course: {
      type: String,
      default: "",
    },

    subject: {
      type: String,
      default: "",
    },

    /* =====================================================
       MASTERY
    ===================================================== */

    masteryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },

    status: {
      type: String,
      enum: [
        "not_started",
        "needs_foundation",
        "developing",
        "practicing",
        "proficient",
        "mastered",
      ],
      default: "not_started",
    },

    /* =====================================================
       EVIDENCE
    ===================================================== */

    evidence: {
      totalAttempts: {
        type: Number,
        default: 0,
      },

      correctAttempts: {
        type: Number,
        default: 0,
      },

      partiallyCorrect: {
        type: Number,
        default: 0,
      },

      incorrectAttempts: {
        type: Number,
        default: 0,
      },

      skippedAttempts: {
        type: Number,
        default: 0,
      },

      independentAttempts: {
        type: Number,
        default: 0,
      },

      independentCorrect: {
        type: Number,
        default: 0,
      },

      totalMarksAwarded: {
        type: Number,
        default: 0,
      },

      totalAvailableMarks: {
        type: Number,
        default: 0,
      },

      totalHintsUsed: {
        type: Number,
        default: 0,
      },
    },

    /* =====================================================
       RECENT PERFORMANCE

       Used to identify short-term improvement
       without losing historical evidence.
    ===================================================== */

    recentEvidence: {
      recentTotal: {
        type: Number,
        default: 0,
      },

      recentCorrect: {
        type: Number,
        default: 0,
      },

      recentMarksAwarded: {
        type: Number,
        default: 0,
      },

      recentAvailableMarks: {
        type: Number,
        default: 0,
      },
    },

    /* =====================================================
       SOURCE TRACKING
    ===================================================== */

    sourceCounts: {
      exam: {
        type: Number,
        default: 0,
      },

      classroom: {
        type: Number,
        default: 0,
      },

      chapter_journey: {
        type: Number,
        default: 0,
      },

      daily_revision: {
        type: Number,
        default: 0,
      },

      homework: {
        type: Number,
        default: 0,
      },

      diagnostic: {
        type: Number,
        default: 0,
      },

      targeted_practice: {
        type: Number,
        default: 0,
      },

      mastery_check: {
        type: Number,
        default: 0,
      },
    },

    /* =====================================================
       PERFORMANCE
    ===================================================== */

    performance: {
      averageMarksPercentage: {
        type: Number,
        default: 0,
      },

      hintUsageRate: {
        type: Number,
        default: 0,
      },

      independentAccuracy: {
        type: Number,
        default: 0,
      },
    },

    /* =====================================================
       TRENDS
    ===================================================== */

    trends: {
      direction: {
        type: String,
        enum: [
          "improving",
          "stable",
          "declining",
          "unknown",
        ],
        default: "unknown",
      },

      consecutiveCorrect: {
        type: Number,
        default: 0,
      },

      consecutiveIncorrect: {
        type: Number,
        default: 0,
      },
    },

    /* =====================================================
       REVISION SCHEDULING
    ===================================================== */

    lastPracticedAt: {
      type: Date,
      default: null,
    },

    nextReviewAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       PROCESSING TRACKING
    ===================================================== */

    lastProcessedAttemptId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    lastEvidenceAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */

// One record per student, course, subject and skill.
StudentSkillMasterySchema.index(
  {
    studentId: 1,
    course: 1,
    subject: 1,
    skillId: 1,
  },
  {
    unique: true,
  }
);

// Find a student's mastery by subject.
StudentSkillMasterySchema.index({
  studentId: 1,
  subject: 1,
});

// Find skills requiring revision.
StudentSkillMasterySchema.index({
  studentId: 1,
  nextReviewAt: 1,
});

// Find skills by mastery status.
StudentSkillMasterySchema.index({
  studentId: 1,
  status: 1,
});

// Find recently updated mastery records.
StudentSkillMasterySchema.index({
  studentId: 1,
  lastPracticedAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

const StudentSkillMastery: Model<any> =
  mongoose.models.StudentSkillMastery ||
  mongoose.model(
    "StudentSkillMastery",
    StudentSkillMasterySchema
  );

export default StudentSkillMastery;