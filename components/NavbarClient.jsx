"use client";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function NavbarClient() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65 ring-1 ring-slate-900/5">
      <div className="mx-auto max-w-7xl px-safe sm:px-6">

        {/* One compact row for all breakpoints */}
        <div className="h-12 md:h-14 flex items-center justify-between pt-[env(safe-area-inset-top)]">
          <Link href="/" className="font-semibold tracking-tight shrink-0">
            MoodTrack
          </Link>

          {/* Links: scrollable on mobile, normal on desktop */}
          <div className="ml-3 flex items-center gap-4 sm:gap-6 text-sm whitespace-nowrap overflow-x-auto no-scrollbar">
            <Link className="shrink-0" href="/log">Log</Link>
            <Link className="shrink-0" href="/history">History</Link>
            <Link className="shrink-0" href="/settings">Settings</Link>
            <Link className="shrink-0" href="/about">About</Link>
            {user ? (
              <span className="shrink-0 opacity-70">
                Signed in as: {user.email || "anonymous"}
              </span>
            ) : (
              <Link className="shrink-0" href="/auth">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
