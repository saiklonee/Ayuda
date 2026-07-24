import rateLimit from "express-rate-limit";

// Applied to login/signup specifically — these are the endpoints most
// worth protecting against brute-force/credential-stuffing attempts.
// Not applied globally; other routes can get their own limiter tuned to
// their own risk (e.g. the ₹1 interaction-payment endpoint will want a
// separate, spam-focused limiter later).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts, please try again later" } },
});
