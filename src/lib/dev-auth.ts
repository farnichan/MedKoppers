import "server-only";

/**
 * Local development only: skip the emailed 6-digit codes, so testing doesn't
 * use up emails. A password alone logs you in, and new accounts are confirmed
 * straight away.
 *
 * Needs BOTH `npm run dev` (NODE_ENV "development") AND
 * SKIP_EMAIL_CODES=true in .env.local. A deployed site (NODE_ENV
 * "production") always requires codes, whatever its env vars say.
 */
export const skipEmailCodes =
  process.env.NODE_ENV === "development" && process.env.SKIP_EMAIL_CODES === "true";
