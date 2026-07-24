import mongoose from "mongoose";

const { Schema } = mongoose;

const verificationRequestSchema = new Schema(
  {
    subjectUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestedTier: {
      type: String,
      enum: ["COMMUNITY_VERIFIED", "DOCUMENT_VERIFIED", "ANON_VERIFIED"],
      required: true,
    },
    submittedDocs: [{ type: String }],

    // For community/anon verification — the partner org vouching for this subject.
    vouchingPartnerOrgId: { type: Schema.Types.ObjectId, ref: "Organization" },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "MORE_INFO_NEEDED"],
      default: "PENDING",
    },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User" },
    reviewNotes: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("VerificationRequest", verificationRequestSchema);
