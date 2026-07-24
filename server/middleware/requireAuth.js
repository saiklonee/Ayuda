import { verifyToken } from "../utils/jwt.js";
import { AppError } from "./AppError.js";
import User from "../models/User.js";

/**
 * Verifies the auth cookie and attaches the authenticated user to req.user.
 * Throws 401 if missing/invalid — caught by errorHandler (relies on
 * express-async-errors-style handling; Express 5 natively forwards thrown
 * errors from async handlers to next(), so no manual try/catch needed here).
 */
export async function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) throw AppError.unauthorized();

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw AppError.unauthorized("Invalid or expired session");
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw AppError.unauthorized("User no longer exists");

  req.user = user;
  next();
}

/**
 * Restricts a route to specific verificationTier values. Use after
 * requireAuth. Example: requireVerificationTier('DOCUMENT_VERIFIED', 'COMMUNITY_VERIFIED')
 */
export function requireVerificationTier(...allowedTiers) {
  return (req, res, next) => {
    if (!req.user) throw AppError.unauthorized();
    if (!allowedTiers.includes(req.user.verificationTier)) {
      throw AppError.forbidden(
        `This action requires one of these verification tiers: ${allowedTiers.join(", ")}`
      );
    }
    next();
  };
}
