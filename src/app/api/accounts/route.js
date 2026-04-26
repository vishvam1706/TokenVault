import { auth } from "@root/auth";
import { connectDB } from "@/lib/mongodb";
import { MODELS } from "@/lib/models";
import Account from "@/models/Account";

// Never cache this route — always fetch fresh from DB
export const dynamic = "force-dynamic";

/**
 * GET /api/accounts
 * Returns all accounts for the authenticated user, sorted by createdAt desc.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const accounts = await Account
      .find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ accounts }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/accounts]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/accounts
 * Creates a new account. Expects:
 * {
 *   email: string,
 *   nickname?: string,
 *   modelTimes: { [modelKey]: { days, hours, minutes } }
 * }
 * Computes resetAt server-side from the supplied remaining time values.
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, nickname, modelTimes } = body;

    // ── Validation ────────────────────────────────────────────
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (nickname && typeof nickname !== "string") {
      return Response.json({ error: "Nickname must be a string" }, { status: 400 });
    }
    if (!modelTimes || typeof modelTimes !== "object") {
      return Response.json({ error: "modelTimes is required" }, { status: 400 });
    }

    // ── Compute resetAt for each model ─────────────────────────
    const now = Date.now();
    const models = MODELS.map(({ key }) => {
      const t = modelTimes[key] || { days: 0, hours: 0, minutes: 0 };
      const d = Math.max(0, parseInt(t.days) || 0);
      const h = Math.max(0, parseInt(t.hours) || 0);
      const m = Math.max(0, parseInt(t.minutes) || 0);
      const offsetMs = (d * 86400 + h * 3600 + m * 60) * 1000;
      return { key, resetAt: new Date(now + offsetMs) };
    });

    await connectDB();
    const account = await Account.create({
      userId: session.user.email,
      email: email.trim().toLowerCase(),
      nickname: (nickname || "").trim(),
      models,
    });

    return Response.json({ account }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/accounts]", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return Response.json({ error: messages.join(", ") }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
