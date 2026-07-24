import express from "express";

const router = express.Router();

// TODO: create post (core-logic.md §3), get feed, get single post,
// edit (restricted post-funding per core-logic.md §4a note on goal drift).
router.get("/", (req, res) => res.json({ module: "posts", status: "scaffolded" }));

export default router;
