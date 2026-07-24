import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AppError } from "../middleware/AppError.js";
import { signToken, authCookieOptions } from "../utils/jwt.js";
import { signupSchema, loginSchema } from "../../shared/validationSchemas.js";

const SALT_ROUNDS = 12;

export async function signup(req, res) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || "Invalid signup data", 422, "VALIDATION_ERROR");
  }
  const { username, email, phone, password, accountType, displayName, handle } = parsed.data;

  const existing = await User.findOne({ $or: [{ email }, { username }, { handle }] });
  if (existing) {
    throw AppError.conflict("An account with this email, username, or handle already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    username,
    email,
    phone,
    passwordHash,
    accountType,
    displayName,
    handle,
    // verificationTier defaults to UNVERIFIED — set by the model default.
    // Per core-logic.md §2: unverified users can browse/donate but cannot
    // post a request or receive payouts until a VerificationRequest is approved.
  });

  const token = signToken({ sub: user._id.toString() });
  res.cookie("token", token, authCookieOptions());

  res.status(201).json({ user: user.toPublicJSON() });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError("Invalid email or password", 422, "VALIDATION_ERROR");
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select("+passwordHash");
  // Deliberately vague error on both "no such user" and "wrong password" —
  // don't leak which one it was, that's a user-enumeration vector.
  if (!user) throw AppError.unauthorized("Invalid email or password");

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) throw AppError.unauthorized("Invalid email or password");

  const token = signToken({ sub: user._id.toString() });
  res.cookie("token", token, authCookieOptions());

  res.json({ user: user.toPublicJSON() });
}

export async function logout(req, res) {
  res.clearCookie("token", authCookieOptions());
  res.json({ success: true });
}

export async function me(req, res) {
  // req.user is set by the requireAuth middleware
  res.json({ user: req.user.toPublicJSON() });
}
