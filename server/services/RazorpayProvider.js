import { PaymentProvider } from "./PaymentProvider.js";

/**
 * First concrete implementation of PaymentProvider. Stubbed until API keys
 * are configured — throws deliberately rather than silently no-op-ing, so
 * a missing integration fails loudly in dev instead of pretending to work.
 */
export class RazorpayProvider extends PaymentProvider {
  constructor() {
    super();
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  }

  async charge({ amount, currency, metadata }) {
    throw new Error("RazorpayProvider.charge() not yet implemented — add SDK call here");
  }

  verifyWebhook(rawBody, signature) {
    throw new Error("RazorpayProvider.verifyWebhook() not yet implemented");
  }

  async refund({ providerTransactionRef, amount }) {
    throw new Error("RazorpayProvider.refund() not yet implemented");
  }
}
