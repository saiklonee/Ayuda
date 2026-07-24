import mongoose from "mongoose";

const { Schema } = mongoose;

const organizationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    legalName: { type: String, required: true },

    // NGO Darpan ID / company registration / 12A-80G etc.
    registrationNumber: { type: String, required: true },
    registrySource: { type: String, enum: ["NGO_DARPAN", "MCA", "OTHER"], required: true },

    // Staff-access-only — never surfaced in a public API response.
    registrationDocUrl: { type: String, required: true, select: false },

    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
