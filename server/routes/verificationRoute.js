import express from "express";

const router = express.Router();

// TODO: submit VerificationRequest, staff review actions
// (core-logic.md §2 — Branches A/B/C).
router.get("/", (req, res) => res.json({ module: "verification", status: "scaffolded" }));

export default router;
