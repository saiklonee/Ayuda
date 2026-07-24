import mongoose from "mongoose";

const { Schema } = mongoose;

const moderationFlagSchema = new Schema(
  {
    targetType: { type: String, enum: ["POST", "USER", "PROOF_OF_WORK"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },

    reportedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, required: true },

    status: {
      type: String,
      enum: ["OPEN", "REVIEWING", "ACTION_TAKEN", "DISMISSED"],
      default: "OPEN",
    },
    staffNotes: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

moderationFlagSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("ModerationFlag", moderationFlagSchema);
