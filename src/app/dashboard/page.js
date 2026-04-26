import { auth } from "@root/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Account from "@/models/Account";
import Header from "@/components/Header";
import DashboardClient from "@/components/DashboardClient";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Dashboard — TokenVault",
  description: "Your Antigravity account token refresh dashboard.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  let accounts = [];
  let dbError = null;

  try {
    await connectDB();
    const accountDocs = await Account.find(
      { userId: session.user.email },
      null,
      { sort: { createdAt: -1 }, lean: true }
    );
    accounts = JSON.parse(JSON.stringify(accountDocs));
  } catch (err) {
    console.error("[Dashboard] DB connection error:", err.message);
    dbError = "Unable to connect to the database. Please check your MongoDB Atlas Network Access settings and ensure your IP is whitelisted.";
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Header />
      <main className="flex-1 relative z-10">
        {dbError ? (
          <div className="max-w-[560px] mx-auto mt-20 px-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#FEF2F2] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] mb-6 rotate-3">
              <AlertTriangle size={28} className="text-red-600 stroke-[2.5px]" />
            </div>
            <h1 className="font-jakarta text-[22px] font-black tracking-[-0.01em] text-text-main mb-3">
              DATABASE CONNECTION FAILED
            </h1>
            <p className="text-text-muted font-bold text-[14px] leading-[1.6] mb-8">
              {dbError}
            </p>
            <div className="p-6 rounded-[24px] bg-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] text-left text-[14px] font-bold text-text-muted mb-8">
              <strong className="text-black text-[15px] block mb-2">Fix:</strong>
              1. Go to <strong className="text-[#29A85C]">cloud.mongodb.com</strong><br />
              2. Security → <strong className="text-[#29A85C]">Network Access</strong><br />
              3. Add IP → <strong className="text-[#29A85C]">Allow Access From Anywhere</strong> (0.0.0.0/0)<br />
              4. Wait for <strong className="text-[#29A85C]">Active</strong> status, then refresh.
            </div>
            <a href="/dashboard" className="btn-primary inline-flex">
              RETRY CONNECTION
            </a>
          </div>
        ) : (
          <DashboardClient initialAccounts={accounts} />
        )}
      </main>
    </div>
  );
}
