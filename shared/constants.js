// Meant for shared/constants.js — imported by both client and server so
// enum values, thresholds, and labels stay in exactly one place.

export const ACCOUNT_TYPES = ["INDIVIDUAL", "NGO", "COMPANY", "DONOR_ONLY"];

export const VERIFICATION_TIERS = [
  "UNVERIFIED",
  "COMMUNITY_VERIFIED",
  "DOCUMENT_VERIFIED",
  "ANON_VERIFIED",
];

export const POST_CATEGORIES = ["MEDICAL", "DISASTER", "EDUCATION", "CONFLICT_EMERGENCY", "OTHER"];

export const POST_STATUSES = [
  "ACTIVE",
  "FUNDED",
  "PROOF_PENDING",
  "PROOF_UPLOADED",
  "CLOSED",
  "FLAGGED",
  "REMOVED",
];

export const PAYOUT_POLICIES = ["PHASED_DEFAULT", "IMMEDIATE_APPROVED"];

// Default phased-release split — see core-logic.md §4a. Exact value is a
// policy decision (still open per core-logic.md §8), kept as one named
// constant so it can change in one place.
export const DEFAULT_INITIAL_RELEASE_PERCENT = 50;

export const MIN_INTERACTION_AMOUNT = 1; // ₹1 to interact

export const CATEGORY_LABELS = {
  MEDICAL: "Medical Emergency",
  DISASTER: "Disaster Relief",
  EDUCATION: "Education",
  CONFLICT_EMERGENCY: "Conflict / Emergency",
  OTHER: "Other",
};
