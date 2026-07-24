import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false }, // never returned by default — see controllers/authController.js login()

    accountType: {
      type: String,
      enum: ["INDIVIDUAL", "NGO", "COMPANY", "DONOR_ONLY"],
      required: true,
    },

    displayName: { type: String, required: true, trim: true },
    handle: { type: String, required: true, unique: true, trim: true },
    bio: { type: String, maxlength: 500 },
    avatarUrl: { type: String },

    verificationTier: {
      type: String,
      enum: ["UNVERIFIED", "COMMUNITY_VERIFIED", "DOCUMENT_VERIFIED", "ANON_VERIFIED"],
      default: "UNVERIFIED",
    },

    isAnonymousMode: { type: Boolean, default: false },

    // Broad only — country/state. Never store precise geolocation here.
    region: { type: String },

    flaggedCount: { type: Number, default: 0 }, // staff-only fraud signal

    // Tokenized reference to the payment provider's payout account —
    // never store raw bank details directly on this document.
    payoutAccountRef: { type: String },
  },
  { timestamps: true }
);

// Never expose sensitive/staff-only fields in default JSON output.
userSchema.methods.toPublicJSON = function toPublicJSON() {
  const { _id, username, displayName, handle, bio, avatarUrl, verificationTier, accountType } = this;
  return { id: _id, username, displayName, handle, bio, avatarUrl, verificationTier, accountType };
};

export default mongoose.model("User", userSchema);
