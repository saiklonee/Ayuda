import express from "express";

const router = express.Router();

// TODO: initiate donation, payment-provider webhook receiver (calls
// ledgerService.confirmDonation), get ledger for a post / globally
// (ledgerService.verifyLedger for the public verification endpoint).
router.get("/", (req, res) => res.json({ module: "donations", status: "scaffolded" }));

export default router;
