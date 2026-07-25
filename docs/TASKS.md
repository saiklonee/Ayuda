# Task Breakdown — Ayuda

Organized by the phased roadmap in `PRD.md`. Check off as you go. Items marked **[policy]** need a product/legal decision before they can be built — see `PRD.md` §10 and `DECISIONS.md` "Still open" notes.

---

## Phase 0 — Project Setup

- [ ] Scaffold backend: Express + Mongoose project structure
- [ ] Scaffold frontend: Vite + React + Tailwind (confirm Tailwind version — see stack notes)
- [ ] Set up MongoDB as a replica set locally (not just in production — required for transactions)
- [ ] Configure `.env` handling on both client (`VITE_` prefix) and server
- [ ] Set up base Mongoose schemas with validators for: `User`, `Post`, `Donation` (strict types/enums — Mongo won't enforce this for you)
- [ ] Set up CI basics: lint, test runner (Vitest client-side)

---

## Phase 1 — MVP: Core Social Feed

Goal: prove the core social + donation UX works, fiat-only, no ledger/anonymity yet.

**Accounts & Profiles**

- [ ] User model: signup/login (email/phone), `account_type` enum (Individual/NGO/Company/Donor)
- [ ] Basic profile page: avatar, bio, display name, handle
- [ ] Posts tab / Donations Made tab / Donations Received tab (basic versions)

**Posts**

- [ ] Post creation form: title, description, category, requested amount, media upload
- [ ] Feed view: post cards with progress bar toward requested amount
- [ ] Post detail page
- [ ] `amount_raised` computed by summing confirmed donations (never incremented in place)

**Payments (fiat only)**

- [ ] Integrate Razorpay/Stripe/UPI
- [ ] Donation flow: select amount → provider checkout → webhook confirms → `Donation` record created inside a Mongo transaction
- [ ] Recalculate `Post.amount_raised` on every confirmed donation
- [ ] Post status transitions: `ACTIVE` → `FUNDED` when `amount_raised >= requested_amount`

**Interactions**

- [ ] ₹1 minimum payment gate for comments/likes
- [ ] `Interaction` record linked to its `Donation`; only visible once donation is `CONFIRMED`
- [ ] Comment/reaction feed under each post

**Real-time**

- [ ] Socket.IO setup on Express server
- [ ] Live donation-count and comment updates on post view

---

## Phase 2 — Verification & Moderation Pipeline

Goal: must exist before real money flows at any meaningful scale.

**Verification**

- [ ] `VerificationRequest` model + submission flow (docs upload, requested tier)
- [ ] Branch A: NGO/Company doc-verified flow — registry check (NGO Darpan/MCA) + staff doc review
- [ ] Branch B: Individual community-verified flow — partner-org vouching request + staff review
- [ ] Branch C: Anonymous-but-verified flow — private identity verification, encrypted storage, staff-access-only
- [ ] Rejection + cooldown-based resubmission logic
- [ ] Per-tier donation caps enforced on post creation **[policy: exact cap values]**
- [ ] Gate: only Community/Document/Anon-verified users can create posts

**Fraud checks on post creation**

- [ ] Duplicate image hash detection
- [ ] Duplicate/near-duplicate description text detection
- [ ] Post-creation velocity check per account
- [ ] Flagged posts held from full feed visibility, routed to `ModerationFlag`

**Admin dashboard**

- [ ] Role-gated internal React app, separate auth guard
- [ ] Review queue: filter by flag type, severity, verification tier
- [ ] Actions: dismiss, request more info, freeze post, remove post, suspend account
- [ ] Audit log: staff_id + timestamp + reason on every action
- [ ] Reporting flow: report post/user from the main app

---

## Phase 3 — Transparency Ledger

**Hash chain**

- [ ] Implement `record_hash` / `prev_hash` computation (SHA-256) on every confirmed `Donation`
- [ ] Single global chain, not per-post
- [ ] Chain-walk verification function (recompute + compare hashes end to end)
- [ ] Public read-only API: full ledger, paginated per-post view
- [ ] **[policy]** Optional: external anchoring of periodic root hash (public timestamping service / blockchain)

**Payout system**

- [ ] `PayoutRelease` model, append-only (corrections = new `REVERSED` records, never edits)
- [ ] Phased default: initial tranche at 50% funding threshold **[policy: confirm/configure %]**
- [ ] Remainder tranche triggered only by `ProofOfWork.status = FORMALLY_VERIFIED`
- [ ] Override path: `IMMEDIATE_APPROVED` policy, requires `payout_policy_set_by` + `payout_policy_notes`
- [ ] **[policy]** Define who holds "senior verifier" authority to approve overrides
- [ ] Refund flow: new `Donation` record with `status = REFUNDED`, references original

**Proof of Work**

- [ ] Upload flow: media + description, server-side EXIF/GPS stripping (non-negotiable, server-side only)
- [ ] Community soft-signal: "looks legitimate" / "flag as unclear" — UX signal only, does not gate payout
- [ ] ML verification pass: confidence score, threshold-based auto-progress **[policy: confidence threshold]**
- [ ] Below-threshold routing to human volunteer review queue
- [ ] Staff override: manually mark `FORMALLY_VERIFIED` or `REJECTED` for high-value/flagged posts
- [ ] **[policy]** Volunteer reviewer vetting/onboarding process — they gate real money, so likely need their own light trust tier

**Trust Panel**

- [ ] Single `GET /api/trust-panel/:subjectType/:subjectId` endpoint
- [ ] `computeTrustScore()` isolated in one service function
- [ ] Checklist derived from existing verification fields (don't duplicate into a new table)
- [ ] One shared frontend component used on org pages, profile pages, post headers

**Impact Stats**

- [ ] `ImpactStats` model as a schema-flexible counters map (not fixed columns)
- [ ] Background job / on-demand recompute (never write directly from request path)

---

## Phase 4 — Privacy & Anonymity Hardening

- [ ] IP-logging exclusion for at-risk account types
- [ ] Tor onion service mirror setup
- [ ] Confirm EXIF/GPS stripping covers all upload paths (proof-of-work, verification docs, profile media)
- [ ] Anonymous-but-verified tier: lock `is_anonymous_mode` behind re-verification step
- [ ] Privacy policy language clarifying "publicly anonymous" vs. "traceable by staff/compliance if legally required" **[policy/legal]**

---

## Phase 5 — Optional Crypto Rail

- [ ] Integrate a donor-side crypto payment option (e.g. USDC on Polygon/Base)
- [ ] Confirm this stays donor-optional — never required for recipients
- [ ] **[policy/legal]** Review VASP regulatory exposure before enabling

---

## Phase 6 — Open-Source Release Prep

- [ ] Audit codebase to separate core platform logic from fraud-detection heuristics / verification-partner details
- [ ] Prepare public repo (core logic only) under chosen open license
- [ ] Keep fraud heuristics and partner details in a private repo/module

---

## Phase 7 — Global Scale-Out

- [ ] Region-specific compliance review per new market **[policy/legal]**
- [ ] Partner-NGO network expansion for verification coverage in new regions
- [ ] **[policy]** Confirm first launch region + payment provider/registry requirements there

---

## Cross-Cutting / Always-On Engineering Discipline

These aren't phase-bound — apply throughout:

- [ ] Every multi-write financial operation wrapped in an explicit Mongo transaction (`session.withTransaction()`)
- [ ] Never increment `amount_raised` in place — always re-derive from the Donation ledger
- [ ] Never write to `ImpactStats` or Trust Panel data directly from a request path
- [ ] All ledger-adjacent records (`Donation`, `PayoutRelease`) are append-only — corrections are new records, never edits
- [ ] Post edits to `requested_amount` after funding begins are restricted or require re-verification (prevents goal-drift abuse)

---

## Legal / Policy Decisions Still Needed (blocking, not engineering)

- [ ] Exact per-tier donation caps
- [ ] Exact initial-release percentage and funding threshold (50% is the stated default)
- [ ] Who is authorized to approve `IMMEDIATE_APPROVED` overrides
- [ ] ML confidence threshold for auto-progressing proof verification
- [ ] Volunteer reviewer vetting/onboarding requirements
- [ ] Partial refund/recovery mechanism if a post is found fraudulent after partial payout
- [ ] Data retention policy for documents/verification records
- [ ] First launch region and associated payment/registry requirements
