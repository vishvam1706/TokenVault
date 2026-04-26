import { handlers } from "@root/auth";

/**
 * Auth.js v5 route handler.
 * Handles all /api/auth/* routes (signin, signout, callback, session, csrf, etc.)
 */
export const { GET, POST } = handlers;
