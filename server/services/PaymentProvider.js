/**
 * Interface every payment provider implementation must satisfy.
 *
 * project-spec.md §5 keeps Razorpay/Stripe/UPI as the primary rail with
 * crypto optional/secondary. donationService depends on this interface,
 * never a specific SDK directly — swapping/adding a provider later means
 * adding a new class here, not touching donation logic.
 */
export class PaymentProvider {
  async charge({ amount, currency, metadata }) {
    throw new Error("charge() not implemented");
  }

  verifyWebhook(rawBody, signature) {
    throw new Error("verifyWebhook() not implemented");
  }

  async refund({ providerTransactionRef, amount }) {
    throw new Error("refund() not implemented");
  }
}
