import mongoose from "mongoose";

const { Schema } = mongoose;

const interactionSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["COMMENT", "LIKE"], required: true },
    content: { type: String }, // nullable for LIKE

    // Every interaction must reference the ₹1+ payment that unlocked it
    // (core-logic.md §1.7, §4). Only becomes visible once that Donation's
    // status is CONFIRMED — enforce this in the service layer's query, not
    // just at write time.
    linkedDonationId: { type: Schema.Types.ObjectId, ref: "Donation", required: true },
  },
  { timestamps: true }
);

interactionSchema.index({ postId: 1, createdAt: -1 });

export default mongoose.model("Interaction", interactionSchema);
