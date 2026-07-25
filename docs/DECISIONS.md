# Architecture & Policy Decisions — Ayuda

**Purpose:** Record of decisions already made, with rationale, so they aren't accidentally re-litigated or re-decided differently mid-build. Each entry follows: **Decision → Why → Rejected alternative(s)**.

---

## D1. Stack: full MERN, not a blockchain-native stack

**Decision:** Node.js + Express, MongoDB, React, Socket.IO. No smart contracts, no on-chain payments as the primary rail.

**Why:** After evaluating a full blockchain/Web3 deployment against the actual goals (accessibility for at-risk/low-resource users, moderation capability, low-friction ₹1 interactions, regulatory exposure), a hybrid fiat-first model won on every axis that matters for this product.

**Rejected:** Full on-chain payments — excludes the most vulnerable target users (conflict-zone recipients unlikely to hold funded crypto wallets), makes the ₹1 interaction gate impractical due to gas costs, and removes the platform's ability to freeze/reverse fraudulent payouts — a capability a donation platform needs.

---

## D2. Database: MongoDB, run as a replica set (including locally)

**Decision:** MongoDB with Mongoose for schema enforcement, run as a replica set in every environment — not just production.

**Why:** Mongo has supported multi-document ACID transactions since v4.0 via replica sets. This is required because the donation ledger sequence — "create Donation + update Post.amount_raised + create Interaction" — must succeed or fail together, or the ledger drifts from reality.

**Note:** Mongo won't stop malformed financial records the way a relational DB's constraints would — schema strictness (amount types, required fields, enums) has to be a deliberate coding discipline via Mongoose validators, not assumed.

**Rejected:** Treating MongoDB's lack of native relational constraints as a blocker and defaulting to Postgres — this was initially flagged as a risk but judged over-cautious; Mongo's transaction support is sufficient as long as transactions are used explicitly around every multi-write financial operation.

---

## D3. Transparency ledger: hash-chained MongoDB collection, not a blockchain

**Decision:** An append-only, cryptographically hash-chained ledger implemented as a MongoDB collection (each record stores `prev_hash` and `record_hash = SHA256(fields + prev_hash)`), publicly queryable via API. Optional: periodically anchor the latest root hash to an external public timestamping service or blockchain.

**Why:** This gives most of blockchain's "publicly verifiable, tamper-evident" benefit without wallet friction, gas fees, or loss of moderation control. Anyone can walk the chain and detect tampering — same guarantee, none of the overhead.

**Chain scope:** One single global chain across the whole platform, not per-post — the entire ledger is one verifiable sequence.

**Rejected:** Putting every donation on-chain — unnecessary overhead (gas costs, wallet requirement) for a guarantee the hash-chain already provides locally. The one place a real blockchain reference adds genuine value is anchoring the root hash externally, not recording every transaction on-chain.

---

## D4. Deployment: centralized backend/DB, decentralized only where it protects access

**Decision:** Docker containers on standard cloud hosting (Render/Railway/Vercel-style) for backend, DB, and moderation tooling. IPFS mirror (via Fleek or similar) for static frontend assets only. Tor onion service mirror for censorship-resistant access.

**Why:** True decentralization conflicts with the need for fast moderation action (removing fraudulent posts, freezing suspicious accounts). IPFS + Tor mirrors give real censorship-resistance benefits without sacrificing that control. Backend, DB, and moderation tooling must remain centrally controllable.

**Rejected:** Fully decentralized deployment of the entire stack.

---

## D5. Payments: fiat-first, crypto optional and donor-side only

**Decision:** Razorpay/Stripe/UPI as the primary rail. Crypto (e.g. USDC on a low-fee L2 like Polygon or Base) as an optional donor-side rail — never required for recipients.

**Why:** Regulated, accessible, no wallet required — critical for at-risk/low-resource recipients who are the platform's core use case.

---

## D6. Admin/moderation tooling: custom-built, budgeted as real scope

**Decision:** A role-gated internal React dashboard on dedicated Express admin routes — built as first-class scope, not bolted on late.

**Why:** There's no free Django-Admin-style equivalent in the MERN stack. This is the platform's biggest fraud-risk surface, so it needs real design/dev time budgeted in from the start.

---

## D7. Verification: tiered trust, not binary verified/unverified

**Decision:** Four tiers — Unverified, Community-verified, Document-verified, Anonymous-but-verified — each gating different capabilities (posting, donation caps), not just a visible badge.

**Why:** A binary verified/unverified flag can't represent the real spectrum of trust needed (an NGO with registry-checked documents vs. an at-risk individual who can only be vouched for privately). Tiering lets the platform extend safe access to vulnerable users without pretending they have the same evidentiary backing as a registered NGO.

**Key rule:** `verification_tier` gates what a user can _do_ (post a request, set donation caps) — never what a donor can _see_ about them beyond what their tier's privacy rules allow.

---

## D8. Payout timing: phased release by default, with a scoped override path

**Decision:** Default (`PHASED_DEFAULT`): up to 50% released on hitting the funding threshold, remainder released only after proof-of-work reaches `FORMALLY_VERIFIED` status. Override (`IMMEDIATE_APPROVED`): a staff member or authorized senior verifier can approve full immediate release for a specific post, with a mandatory recorded reason.

**Why:** Phased release balances getting money to people who need it quickly against holding enough back to make fraud recoverable. The override path exists because rigid phasing would be actively harmful in some cases (an established, trusted org; an acute emergency where waiting for proof costs safety/time) — but it's deliberately gated and audited so it can't become a silent backdoor.

**Still open:** exact initial-release percentage (50% is the stated default, may vary by category); who exactly holds "senior verifier" authority to approve overrides.

---

## D9. Proof-of-work verification: two independent tracks, only one gates money

**Decision:** Community flagging (any donor can mark proof "looks legitimate" or "flag as unclear") is a **soft trust/UX signal only**. Formal verification (ML model, falling back to human volunteer review below a confidence threshold) is the **only** thing that gates remainder payout release. The two run in parallel and can disagree.

**Why:** Conflating a social trust signal with the actual money-release gate would let a small number of donor upvotes/downvotes control fund release — too easy to game and too disconnected from actual evidence review. Keeping them separate means the community signal can still inform staff attention (e.g. a community-flagged-unclear post gets a closer look) without being the release mechanism itself.

**Design constraint:** ML is a filter/prioritizer, not a sole gatekeeper — low-confidence results route to a human, they don't auto-reject.

---

## D10. Ledger writes: multi-document transactions, always

**Decision:** The "create Donation + recalculate Post.amount_raised (+ create Interaction, if applicable)" sequence always runs inside an explicit MongoDB multi-document transaction (`session.withTransaction()`).

**Why:** These writes must succeed or fail together — a partial write (Donation created but Post total not updated) breaks the "re-derive, don't trust" integrity model the whole ledger depends on.

---

## D11. Derived/aggregate data: always re-computed, never trusted as source of truth

**Decision:** `Post.amount_raised`, `ImpactStats`, and the Trust Panel's `trust_score`/checklist are all denormalized, re-derivable caches — never written to directly from a request path, never trusted for anything payout-related without re-deriving from the Donation ledger.

**Why:** Prevents drift/double-counting bugs and keeps a single source of truth (the ledger) instead of multiple places that can silently disagree.

---

## D12. Trust Panel: one shared component, not three implementations

**Decision:** A single backend endpoint (`GET /api/trust-panel/:subjectType/:subjectId`) and single frontend component serving organization pages, individual profile pages, and post headers — not three separate implementations of the same panel.

**Why:** The UI reference designs show the same trust-score-plus-checklist-plus-ledger-link pattern recurring across all three contexts. Building it three times guarantees divergence the first time the checklist logic changes. The scoring formula itself lives in one isolated `computeTrustScore()` function so it can change without touching every place the score is displayed.

---

## D13. Records are append-only; corrections are new records, not edits

**Decision:** Applies to both `Donation` (refunds) and `PayoutRelease` (clawbacks) — a correction is always a new record referencing the original (e.g. `status = REFUNDED` or `status = REVERSED`), never a mutation of the original.

**Why:** This is what makes the hash chain meaningful — if records could be edited in place, tamper-evidence would be worthless. Same discipline extends to payout records for the same reason.

---

## D14. Media privacy: server-side EXIF/GPS stripping, non-negotiable

**Decision:** All uploaded media (proof-of-work photos, verification docs) passes through server-side EXIF/GPS metadata stripping on upload.

**Why:** Client-side stripping can't be trusted (client can be bypassed or modified). For at-risk users, leaked GPS metadata in an uploaded photo could be a genuine safety risk — this has to be enforced server-side, always.

---

## D15. VPN: not built in-house

**Decision:** No in-house VPN service. Approach is no IP logging + Tor mirror + user guidance pointing at-risk users to Tor Browser/reputable third-party VPNs.

**Why:** A VPN operates at the network level, before traffic reaches the app — it can't be meaningfully "built into" a web app. Operating one in-house would add significant infrastructure and legal-liability burden for a benefit that's already covered by no-logging + Tor.

---

## D16. Open-source strategy: publish core, keep fraud heuristics private

**Decision:** Release core platform code (feed, posts, payment integration, ledger logic) under an open license once trust/safety architecture is stable. Keep specific fraud-detection heuristics and verification-partner details private even in an otherwise open repo.

**Why:** Publishing fraud-detection logic before the system has proven itself in production risks handing bad actors a roadmap to route around it.
