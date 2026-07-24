import express from "express";

const router = express.Router();

// TODO: report content, staff review queue (core-logic.md §7).
router.get("/", (req, res) => res.json({ module: "moderation", status: "scaffolded" }));

export default router;
