import { auth } from "@root/auth";
import { connectDB } from "@/lib/mongodb";
import { MODELS } from "@/lib/models";
import Account from "@/models/Account";

// Never cache this route — always execute fresh
export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { email, nickname, modelTimes } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
    }

    const now = Date.now();
    const models = MODELS.map(({ key }) => {
      const t = modelTimes?.[key] || { days: 0, hours: 0, minutes: 0 };
      const d = Math.max(0, parseInt(t.days) || 0);
      const h = Math.max(0, parseInt(t.hours) || 0);
      const m = Math.max(0, parseInt(t.minutes) || 0);
      const offsetMs = (d * 86400 + h * 3600 + m * 60) * 1000;
      return { key, resetAt: new Date(now + offsetMs) };
    });

    await connectDB();

    const account = await Account.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      { email: email.trim().toLowerCase(), nickname: (nickname || "").trim(), models },
      { new: true, runValidators: true }
    );

    if (!account) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    return Response.json({ account }, { status: 200 });
  } catch (err) {
    console.error("[PUT /api/accounts/[id]]", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return Response.json({ error: messages.join(", ") }, { status: 400 });
    }
    if (err.name === "CastError") {
      return Response.json({ error: "Invalid account ID" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const account = await Account.findOneAndDelete({ _id: id, userId: session.user.email });

    if (!account) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/accounts/[id]]", err);
    if (err.name === "CastError") {
      return Response.json({ error: "Invalid account ID" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
