# Product Requirements Document — Ayuda

**Status:** Pre-build planning
**Version:** 0.1 (Draft for review)
**Companion docs:** `DECISIONS.md`, `TASKS.md`

---

## 1. Vision

A social, feed-style platform where verified individuals in genuine need, and registered NGOs/companies representing causes, can post their need publicly. Donors — individuals or organizations — can donate directly, with every transaction shown transparently against the post.

Long-term goal: a global platform where people in conflict zones, disasters, or crises can request help while staying personally safe and anonymous, with donors able to independently verify that funds were actually sent and used.

**Core promise:** _"You don't have to trust the platform, you can see the money move."_

---

## 2. Problem Statement

- Existing crowdfunding platforms (GoFundMe, Ketto, Milaap) are largely opaque about fund utilization and rely entirely on platform-level trust.
- People in acute need — especially in conflict zones or under political risk — cannot always safely reveal their identity or location to ask for help.
- Donors have no easy way to verify that a specific donation reached a specific verified cause, or that reported "proof of use" is genuine.
- There's no social-feed-native experience for this: giving and social media are currently separate categories of app.

---

## 3. Target Users

| User type                  | Description                                                                  | Key needs                                                     |
| -------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Verified Individual        | Person directly in need, or a trusted representative posting on their behalf | Safety/anonymity, ease of posting, fast payout access         |
| Registered NGO             | Verified nonprofit organization                                              | Bulk campaign posting, credibility signaling, reporting tools |
| Company / CSR Donor        | Businesses donating as part of CSR                                           | Public recognition, transaction receipts, tax documentation   |
| Individual Donor           | General public                                                               | Trust signals, low-friction micro-donations, transparency     |
| Moderator / Trust & Safety | Platform-side                                                                | Verification workflows, fraud detection, takedown tools       |

---

## 4. Core Features (v1 scope)

### 4.1 Accounts & Profiles

- Instagram/Twitter-style profile: avatar, bio, tiered verified badge, Posts tab, Donations Made tab, Donations Received tab
- Account types: Individual (verified/unverified), NGO, Company, Donor-only

### 4.2 Posts (Need Requests)

- Title, description, requested amount, category (medical, disaster relief, education, conflict/emergency, etc.), optional media
- Public transaction ledger displayed directly below the post: donor, amount, timestamp — each entry independently verifiable
- Progress bar toward requested amount
- Proof-of-use box unlocks once the requested amount is raised

### 4.3 Interactions

- Minimum ₹1 "pay to interact" gate for comments/reactions — discourages spam, and every interaction is itself a micro-donation
- Comment/reaction feed under each post

### 4.4 Verification System (tiered, not binary)

- NGO/company registration document review
- Individual need verification via partner-NGO vouching or document review
- Visible trust tiers rather than a binary "verified/not"

### 4.5 Payments

- Primary: regulated fiat rails (UPI/Razorpay/Stripe)
- Optional: crypto donation rail for donors who prefer it (not required for recipients)
- Every transaction, regardless of rail, is written to a public, tamper-evident ledger

### 4.6 Anonymity & Safety Layer

- Recipients can post under a pseudonymous handle while still being verified server-side by a trusted partner
- No IP logging for at-risk accounts; Tor mirror; automatic EXIF/metadata stripping on uploaded media

### 4.7 Moderation & Reporting

- Report post/user
- Admin dashboard: review queue, fraud flags, payout freeze capability, audit trail

---

## 5. Verification Tiers

| Tier                   | Who                                              | Verification method                                                                               | Platform limits                                    |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Unverified             | New individual accounts                          | Email/phone only                                                                                  | Lower donation cap, no proof-of-use requirement    |
| Community-verified     | Individual vouched for by a verified NGO partner | Partner NGO confirms identity/need out-of-band                                                    | Standard donation cap                              |
| Document-verified      | NGO/Company                                      | Registration number checked against government registry (e.g. NGO Darpan), manual document review | Full features, campaign tools                      |
| Anonymous-but-verified | At-risk individual (conflict zone, etc.)         | Identity verified privately by trusted partner org; public handle stays pseudonymous              | Full donation cap, identity never exposed publicly |

---

## 6. Transparency & Privacy Requirements

**Transparency:**

- Every donation written to an append-only, cryptographically hash-chained ledger
- Ledger is publicly queryable/exportable so donors and auditors can independently verify a post's donation history
- Optional: periodically publish a signed root hash externally for extra tamper-evidence

**Privacy:**

- No IP address logging for at-risk account types
- Automatic EXIF/GPS metadata stripping on all uploaded media
- Recipient real identity never exposed publicly for anonymous-but-verified accounts
- Donor identity shown publicly only with consent (default: username shown; anonymous option available)
- Tor onion service mirror for access in monitored/censored regions

---

## 7. Regulatory Considerations (flag for legal review, not a blocker)

- Cross-border transfers, especially to conflict/crisis regions, may be subject to money-transmission and AML/KYC regulations depending on jurisdiction
- A crypto rail introduces a second regulatory regime (VASP rules) on top of fiat rails
- Legal consultation recommended before enabling real-money transactions at scale, particularly for cross-border and conflict-zone use cases

---

## 8. Phased Roadmap

1. **MVP — Core social feed:** posts, fiat payments only, basic profile/verification, no blockchain, no anonymity layer yet
2. **Verification & moderation pipeline:** tiered verification, admin review dashboard, reporting/fraud flagging — must exist before real money flows at scale
3. **Transparency ledger:** hash-chained public transaction log, optional blockchain anchoring
4. **Privacy/anonymity hardening:** Tor mirror, IP-logging exclusions, EXIF stripping, anonymous-but-verified tier
5. **Optional crypto donation rail:** added once fiat flow is stable
6. **Open-source release:** publish once verification/fraud-prevention logic is reasoned through
7. **Global scale-out:** region-specific compliance review, partner-NGO network expansion

---

## 9. Out of Scope for v1

- Full on-chain payments (excludes at-risk users without crypto wallets, makes ₹1 interaction gate impractical due to gas costs)
- Fully decentralized deployment of backend/moderation tooling (conflicts with need for fast moderation action)
- In-house VPN service (network-level, out of scope for a web app; guidance points users to Tor/reputable VPNs instead)

---

## 10. Open Questions

- Which region(s) to launch first, and which payment providers/registries are needed there?
- Who are the initial partner NGOs for identity vouching?
- What's the fraud-review SLA before a post goes live?
- What happens to funds raised on a post later found to be fraudulent (refund mechanism)?
- Data retention policy — how long are documents/verification records kept, and where?
- Exact per-tier donation caps (policy decision, not engineering)
