import Donation from "../models/Donation.js";
import Post from "../models/Post.js";
import { AppError } from "../middleware/AppError.js";
import { confirmDonation } from "./ledgerService.js";
import { RazorpayProvider } from "./RazorpayProvider.js";

const paymentProvider = new RazorpayProvider();

/**
 * Step 1 of a donation: create a PENDING record and kick off the charge
 * with the payment provider. The Donation only becomes CONFIRMED (and
 * enters the ledger/hash chain) once the webhook fires — see
 * confirmFromWebhook below. This function does NOT touch the ledger.
 */
export async function initiateDonation({ postId, donorId, amount, currency = "INR", isDonorAnonymous, isInteractionPayment, interactionPayload }) {
  const post = await Post.findById(postId);
  if (!post) throw AppError.notFound("Post not found");
  if (!["ACTIVE", "FUNDED"].includes(post.status)) {
    throw new AppError("This post is not currently accepting donations", 409, "POST_NOT_ACCEPTING_DONATIONS");
  }

  const { providerTransactionRef, checkoutUrl } = await paymentProvider.charge({
    amount,
    currency,
    metadata: { postId: postId.toString(), donorId: donorId?.toString(), isInteractionPayment },
  });

  // Store the pending attempt so the webhook has something to reconcile
  // against. Not part of the hash chain yet — only CONFIRMED donations are.
  await Donation.create({
    postId,
    donorId: isDonorAnonymous ? undefined : donorId,
    amount,
    currency,
    paymentProvider: "RAZORPAY",
    providerTransactionRef,
    isDonorAnonymous,
    isInteractionPayment,
    status: "PENDING",
  });

  return { checkoutUrl, providerTransactionRef };
}

/**
 * Called from the webhook route once the provider confirms payment
 * succeeded. This is what actually writes into the ledger via
 * ledgerService.confirmDonation (core-logic.md §4, §5).
 */
export async function confirmFromWebhook({ providerTransactionRef, postId, donorId, amount, currency, isDonorAnonymous, isInteractionPayment, interactionPayload }) {
  return confirmDonation({
    postId,
    donorId,
    amount,
    currency,
    paymentProvider: "RAZORPAY",
    providerTransactionRef,
    isDonorAnonymous,
    isInteractionPayment,
    interactionPayload,
  });
}

export async function getLedgerForPost(postId) {
  return Donation.find({ postId, status: "CONFIRMED" })
    .sort({ createdAt: -1 })
    .populate("donorId", "displayName handle avatarUrl");
}