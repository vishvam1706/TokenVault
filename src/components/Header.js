"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-12 h-[88px] bg-transparent">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 outline-none rounded-full focus-visible:ring-2 focus-visible:ring-black">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black bg-white">
          <img src="/tokenvault_logo.svg" alt="TokenVault Logo" className="w-full h-full object-cover scale-110" />
        </div>
        <span className="font-jakarta text-[22px] font-extrabold tracking-[-0.03em] text-text-main">
          TokenVault
        </span>
      </Link>

      {/* User info + logout */}
      {session?.user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-block text-[14px] text-text-main font-bold max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
              {session.user.name}
            </span>
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={36} height={36}
                className="rounded-full border-2 border-black"
              />
            )}
          </div>
          <button
            id="logout-btn"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn-ghost !font-bold !px-3 md:!px-4"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
}
