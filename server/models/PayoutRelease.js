import mongoose from "mongoose";

const { Schema } = mongoose;

// Tracks each payout tranche against a post. Same append-only discipline as
// Donation — a correction (clawback) is a new record with status = REVERSED
// referencing the original, never a mutation (core-logic.md §1.6a, §4a).
const payoutReleaseSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    tranche: { type: String, enum: ["INITIAL", "REMAINDER", "FULL_IMMEDIATE"], required: true },
    amount: { type: Number, required: true, min: 0 },

    trigger: {
      type: String,
      enum: ["FUNDING_THRESHOLD", "PROOF_VERIFIED", "VERIFIER_OVERRIDE"],
      required: true,
    },
    // Staff/verifier who approved an override — null if automatic.
    triggeredBy: { type: Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["PENDING", "RELEASED", "HELD", "REVERSED"],
      default: "PENDING",
    },
    releasedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

payoutReleaseSchema.index({ postId: 1, createdAt: -1 });

export default mongoose.model("PayoutRelease", payoutReleaseSchema);
