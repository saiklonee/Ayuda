import crypto from "crypto";
import Donation from "../models/Donation.js";
import Post from "../models/Post.js";
import Interaction from "../models/Interaction.js";
import { withTransaction } from "../utils/withTransaction.js";

/**
 * Computes the SHA-256 hash for a donation record, chained to the previous
 * record's hash. See core-logic.md §5 — this is what makes the ledger
 * publicly verifiable without needing a blockchain.
 */
export function computeRecordHash({
  donationId,
  postId,
  donorId,
  amount,
  currency,
  providerTransactionRef,
  timestamp,
  prevHash,
}) {
  const payload = [
    donationId,
    postId,
    donorId || "anonymous",
    amount,
    currency,
    providerTransactionRef,
    timestamp,
    prevHash || "",
  ].join("|");

  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Confirms a donation after a payment provider webhook reports success.
 * Runs as a single Mongo transaction: create the Donation record, recompute
 * Post.amountRaised from the ledger (never increment in place), and create
 * the linked Interaction if this was the min-payment gating a comment/like.
 * All succeed together or not at all (core-logic.md §4).
 */
export async function confirmDonation({
  postId,
  donorId,
  amount,
  currency,
  paymentProvider,
  providerTransactionRef,
  isDonorAnonymous,
  isInteractionPayment,
  interactionPayload,
}) {
  return withTransaction(async (session) => {
    const lastDonation = await Donation.findOne({ status: "CONFIRMED" })
      .sort({ createdAt: -1 })
      .session(session);

    const timestamp = new Date();
    const prevHash = lastDonation ? lastDonation.recordHash : null;

    const donation = new Donation({
      postId,
      donorId: isDonorAnonymous ? undefined : donorId,
      amount,
      currency,
      paymentProvider,
      providerTransactionRef,
      isDonorAnonymous,
      isInteractionPayment,
      status: "CONFIRMED",
      prevHash,
    });

    donation.recordHash = computeRecordHash({
      donationId: donation._id.toString(),
      postId: postId.toString(),
      donorId: isDonorAnonymous ? null : donorId?.toString(),
      amount,
      currency,
      providerTransactionRef,
      timestamp: timestamp.toISOString(),
      prevHash,
    });

    await donation.save({ session });

    // Re-derive amountRaised from the ledger — never trust a running total.
    const [{ total } = { total: 0 }] = await Donation.aggregate([
      { $match: { postId: donation.postId, status: "CONFIRMED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).session(session);

    const post = await Post.findById(postId).session(session);
    post.amountRaised = total;

    if (total >= post.requestedAmount && post.status === "ACTIVE") {
      post.status = "FUNDED";
      post.fundedAt = timestamp;
      // TODO: trigger notification + kick off phased payout release
      // per core-logic.md §4a once a payoutService exists.
    }

    await post.save({ session });

    let interaction = null;
    if (isInteractionPayment && interactionPayload) {
      const [doc] = await Interaction.create(
        [
          {
            postId,
            userId: donorId,
            type: interactionPayload.type,
            content: interactionPayload.content,
            linkedDonationId: donation._id,
          },
        ],
        { session }
      );
      interaction = doc;
    }

    return { donation, post, interaction };
  });
}

/**
 * Walks the global donation chain and verifies every record_hash matches
 * its stored fields and prev_hash matches the prior record.
 */
export async function verifyLedger() {
  const donations = await Donation.find({ status: "CONFIRMED" }).sort({ createdAt: 1 });

  let prevHash = null;
  for (const d of donations) {
    const expectedHash = computeRecordHash({
      donationId: d._id.toString(),
      postId: d.postId.toString(),
      donorId: d.isDonorAnonymous ? null : d.donorId?.toString(),
      amount: d.amount,
      currency: d.currency,
      providerTransactionRef: d.providerTransactionRef,
      timestamp: d.createdAt.toISOString(),
      prevHash,
    });

    if (expectedHash !== d.recordHash || (d.prevHash || null) !== prevHash) {
      return { valid: false, brokenAt: d._id };
    }
    prevHash = d.recordHash;
  }

  return { valid: true };
}
