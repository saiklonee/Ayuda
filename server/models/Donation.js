import mongoose from "mongoose";

const { Schema } = mongoose;

// This is the ledger. Append-only by convention — never mutate a confirmed
// record. Corrections (e.g. refunds) are new records referencing the
// original, never edits or deletes (core-logic.md §4, §5).
const donationSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    donorId: { type: Schema.Types.ObjectId, ref: "User" }, // nullable if anonymous donor
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },

    paymentProvider: {
      type: String,
      enum: ["RAZORPAY", "STRIPE", "UPI", "CRYPTO"],
      required: true,
    },
    providerTransactionRef: { type: String, required: true },

    isDonorAnonymous: { type: Boolean, default: false },
    isInteractionPayment: { type: Boolean, default: false },

    // Hash chain — see core-logic.md §5. A single GLOBAL chain across the
    // whole platform, not per-post, so the whole ledger is one verifiable
    // sequence.
    prevHash: { type: String },
    recordHash: { type: String },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

donationSchema.index({ postId: 1, status: 1, createdAt: -1 });
donationSchema.index({ providerTransactionRef: 1 }, { unique: true });

export default mongoose.model("Donation", donationSchema);
