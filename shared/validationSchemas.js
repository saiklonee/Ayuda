import { z } from "zod";

// These are meant to live in shared/validationSchemas.js so both the client
// (form validation) and server (request validation) import the same source
// of truth — no duplicated validation logic between the two.

export const AccountType = z.enum(["INDIVIDUAL", "NGO", "COMPANY", "DONOR_ONLY"]);
export const VerificationTier = z.enum([
  "UNVERIFIED",
  "COMMUNITY_VERIFIED",
  "DOCUMENT_VERIFIED",
  "ANON_VERIFIED",
]);
export const PostCategory = z.enum([
  "MEDICAL",
  "DISASTER",
  "EDUCATION",
  "CONFLICT_EMERGENCY",
  "OTHER",
]);
export const PostStatus = z.enum([
  "ACTIVE",
  "FUNDED",
  "PROOF_PENDING",
  "PROOF_UPLOADED",
  "CLOSED",
  "FLAGGED",
  "REMOVED",
]);

export const signupSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  accountType: AccountType,
  displayName: z.string().min(1).max(100),
  handle: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Handle can only contain lowercase letters, numbers, and underscores"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createPostSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20).max(5000),
  category: PostCategory,
  requestedAmount: z.number().positive(),
  media: z.array(z.string().url()).optional(),
});

// The minimum ₹1 interaction gate — kept as a named constant here (not a
// magic number) so it can be imported by both the donation amount check and
// any UI copy referencing it.
export const MIN_INTERACTION_AMOUNT = 1;

export const donateSchema = z.object({
  postId: z.string(),
  amount: z.number().min(MIN_INTERACTION_AMOUNT),
  isDonorAnonymous: z.boolean().default(false),
  isInteractionPayment: z.boolean().default(false),
  interactionPayload: z
    .object({
      type: z.enum(["COMMENT", "LIKE"]),
      content: z.string().max(1000).optional(),
    })
    .optional(),
});

export const submitVerificationSchema = z.object({
  requestedTier: z.enum(["COMMUNITY_VERIFIED", "DOCUMENT_VERIFIED", "ANON_VERIFIED"]),
  submittedDocs: z.array(z.string().url()).min(1),
  vouchingPartnerOrgId: z.string().optional(),
});
