import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // --- Clerk Integration (for now, removable later) ---
    // clerkId: { type: String,default: "ID",unique:false,required:false}, // still allow null for JWT users
clerkId: { type: String, sparse: true, default: null },

    // --- Basic Info ---
    username: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    phone:{type:String},

        trialStart: { type: Date, default: null },
trialEnd: { type: Date, default: null },
hasUsedTrial: { type: Boolean, default: false },

    // --- Auth Credentials ---
    password: { type: String }, // for email/password login
    googleId: { type: String, default: null }, // for Google login
    isEmailVerified: { type: Boolean, default: false },

    // --- App Structure ---
    role: {
      type: String,
      enum: ["admin", "college", "teacher", "student"],
      default: "student",
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
    },
    isIndividual: { type: Boolean, default: false },
    courses: [{ type: String }],

    // --- Subscription Info ---
    isSubscribed: { type: Boolean, default: false },
    subscriptionPlan: {
      type: String,
      enum: ["basic", "pro", "enterprise", null],
      default: null,
    },
points: {
  type: Number,
  default: 0,
},
level: {
  type: Number,
  default: 1,
},
levelName: {
  type: String,
  default: "Steady Mind",
},

// --- Tokens for email verification & password reset ---
emailVerificationToken: { type: String, default: null },
emailVerificationOTP: { type: String, default: null },
emailVerificationExpires: { type: Date, default: null },
passwordResetToken: { type: String, default: null },
passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
