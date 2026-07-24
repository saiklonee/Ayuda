import mongoose from "mongoose";

const { Schema } = mongoose;

// Read-optimized cache, NOT a source of truth. Always re-derivable from the
// Donation ledger and ProofOfWork records (core-logic.md §1.1a). Never write
// to this from a request path — recompute via a background job or on-demand
// query, same discipline as Post.amountRaised.
const impactStatsSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, required: true, refPath: "subjectType" },
    subjectType: { type: String, enum: ["User", "Organization"], required: true },

    totalRaised: { type: Number, default: 0 },
    totalDonated: { type: Number, default: 0 },

    // Schema-flexible counters map — new impact categories (families
    // assisted, meals provided, etc.) don't require a migration.
    counters: { type: Map, of: Number, default: {} },

    lastRecalculatedAt: { type: Date },
  },
  { timestamps: true }
);

impactStatsSchema.index({ subjectId: 1, subjectType: 1 }, { unique: true });

export default mongoose.model("ImpactStats", impactStatsSchema);
