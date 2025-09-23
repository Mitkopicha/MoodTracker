"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { signOutCurrent } from "../lib/firebaseClient";

export default function Navbar() {
  const { user } = useAuth();

  async function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
      await signOutCurrent();
      window.location.href = "/auth/sign-in"; // redirect after logout
    }
  }

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white shadow">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-lg">
          MoodTrack
        </Link>
        <Link href="/log">Log</Link>
        <Link href="/history">History</Link>
        <Link href="/settings">Settings</Link>
        <Link href="/about">About</Link>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="text-gray-700">
              Signed in as: <b>{user.email}</b>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            href="/auth/sign-in"
            className="px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
