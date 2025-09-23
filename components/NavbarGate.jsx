"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { signOutCurrent } from "../lib/firebaseClient";

export default function NavbarGate() {
  const { user } = useAuth();

  async function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
      await signOutCurrent();
      // Hard redirect so all client state clears
      window.location.href = "/auth/sign-in";
    }
  }

  return (
    <nav className="w-full bg-white/95 backdrop-blur border-b border-black/5">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: brand + links */}
        <div className="flex items-center gap-5">
          <Link href="/" className="font-bold text-lg">MoodTrack</Link>
          <Link href="/log" className="hover:underline">Log</Link>
          <Link href="/history" className="hover:underline">History</Link>
          <Link href="/settings" className="hover:underline">Settings</Link>
          <Link href="/about" className="hover:underline">About</Link>
        </div>

        {/* Right: session area */}
        <div className="flex items-center gap-3 flex-wrap">
          {user ? (
            <>
              <span className="text-sm text-gray-700 max-w-[42ch] truncate">
                Signed in as: <b title={user.email || ""}>{user.email || "—"}</b>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 active:scale-[.99] transition"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="text-sm px-3 py-1.5 rounded-md border border-blue-600 text-blue-700 hover:bg-blue-50 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
