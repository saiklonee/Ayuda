import mongoose from "mongoose";

/**
 * Runs `fn` inside a Mongo multi-document transaction and commits/aborts it.
 *
 * Required for any write that touches more than one collection and must
 * succeed or fail atomically — the clearest example is confirming a
 * donation: creating the Donation record + recalculating Post.amountRaised
 * (+ creating an Interaction, if this was a min-payment interaction) must
 * all land together or not at all (see core-logic.md §4, §4a).
 *
 * Requires MONGODB_URI to point at a replica set — see configs/db.js.
 */
export async function withTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}
