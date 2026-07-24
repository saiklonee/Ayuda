import express from "express";

const router = express.Router();

// TODO: upload proof (through CloudinaryStorageBackend), community flag,
// formal ML/human-volunteer verification (core-logic.md §6, §4a).
router.get("/", (req, res) => res.json({ module: "proofOfWork", status: "scaffolded" }));

export default router;
