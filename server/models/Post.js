import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["MEDICAL", "DISASTER", "EDUCATION", "CONFLICT_EMERGENCY", "OTHER"],
      required: true,
    },
    requestedAmount: { type: Number, required: true, min: 1 },

    // Denormalized — recalculated from confirmed Donations. NEVER trust this
    // field alone for anything payout-related; always re-derive from the
    // ledger (core-logic.md §1.4, §4).
    amountRaised: { type: Number, default: 0 },

    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["ACTIVE", "FUNDED", "PROOF_PENDING", "PROOF_UPLOADED", "CLOSED", "FLAGGED", "REMOVED"],
      default: "ACTIVE",
    },

    media: [{ type: String }],
    isAnonymousPost: { type: Boolean, default: false },
    fundedAt: { type: Date },

    // Phased payout release policy — see core-logic.md §4a
    payoutPolicy: {
      type: String,
      enum: ["PHASED_DEFAULT", "IMMEDIATE_APPROVED"],
      default: "PHASED_DEFAULT",
    },
    payoutPolicySetBy: { type: Schema.Types.ObjectId, ref: "User" },
    payoutPolicyNotes: { type: String },
  },
  { timestamps: true }
);

postSchema.index({ status: 1, category: 1, createdAt: -1 }); // feed query pattern

export default mongoose.model("Post", postSchema);
