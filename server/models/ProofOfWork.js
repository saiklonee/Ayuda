import mongoose from "mongoose";

const { Schema } = mongoose;

const proofOfWorkSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // EXIF/GPS-stripped on upload before storage — enforced server-side in
    // the storage service, never trust client-side stripping (core-logic.md §6).
    media: [{ type: String }],
    description: { type: String },

    status: {
      type: String,
      enum: [
        "PENDING_UPLOAD",
        "UPLOADED",
        "COMMUNITY_VERIFIED", // soft donor signal — does NOT gate payout
        "FORMALLY_VERIFIED", // gates the remainder payout, see core-logic.md §4a
        "FLAGGED_UNCLEAR",
        "REJECTED",
      ],
      default: "PENDING_UPLOAD",
    },

    // Formal verification — distinct from the soft community flag.
    verificationMethod: {
      type: String,
      enum: ["NONE", "ML_MODEL", "HUMAN_VOLUNTEER", "STAFF"],
      default: "NONE",
    },
    mlConfidenceScore: { type: Number, min: 0, max: 1 },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("ProofOfWork", proofOfWorkSchema);
