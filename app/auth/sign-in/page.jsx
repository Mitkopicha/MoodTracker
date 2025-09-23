"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseApp } from "../../../lib/firebaseClient";

/** Puffy cloud */
function Cloud({ className }) {
  return (
    <svg viewBox="0 0 240 120" className={className} aria-hidden>
      <path d="M60 95c-22 0-40-15-40-34 0-18 13-31 30-33C58 12 78 0 101 0c30 0 54 23 56 51 20 2 35 17 35 36 0 20-18 33-42 33H60z" fill="white" />
    </svg>
  );
}

export default function SignInPage() {
  const auth = getAuth(getFirebaseApp());
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [msg,   setMsg]   = useState("");
  const [pending, startTransition] = useTransition();

  // If already signed in, bounce to next or "/"
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) router.replace(params.get("next") ? decodeURIComponent(params.get("next")) : "/");
    });
    return () => unsub();
  }, [auth, router, params]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      startTransition(() => {
        router.replace(params.get("next") ? decodeURIComponent(params.get("next")) : "/");
      });
    } catch (err) {
      setMsg(err?.message || "Sign-in failed");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sky */}
      <div className="fixed inset-0 bg-gradient-to-b from-sky-200 via-sky-300 to-sky-500" />

      {/* Clouds */}
      <Cloud className="cloud absolute -top-10 -left-16 w-56 opacity-95 drop-shadow" />
      <Cloud className="cloud-slow absolute top-8 right-8 w-48 opacity-95 drop-shadow" />
      <Cloud className="cloud absolute bottom-32 left-8 w-64 opacity-95 drop-shadow" />
      <Cloud className="cloud-slow absolute bottom-10 right-16 w-52 opacity-95 drop-shadow" />

      {/* Horizon */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[160%] h-40 bg-sky-200/85 rounded-t-[120px]" />

      {/* Card */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 min-h-[100svh] flex items-start md:items-center justify-center">
        <form
          onSubmit={submit}
          className="mt-12 md:mt-0 w-full max-w-md rounded-3xl bg-gradient-to-b from-amber-100 via-amber-300 to-amber-200
                     border border-amber-300 ring-1 ring-white/85 shadow-[0_18px_60px_rgba(245,158,11,0.35)]
                     px-4 py-5 sm:px-6 sm:py-7"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
            borderRadius: "24px",
          }}
        >
          <h1 className="text-2xl font-semibold text-amber-900 tracking-tight text-center">Welcome Back</h1>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="mt-5 w-full h-12 rounded-xl bg-white/90 border border-amber-200 px-3 text-[15px]
                       placeholder:text-amber-800/55 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
            required
            autoComplete="email"
            inputMode="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e)=>setPass(e.target.value)}
            className="mt-3 w-full h-12 rounded-xl bg-white/90 border border-amber-200 px-3 text-[15px]
                       placeholder:text-amber-800/55 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
            required
            autoComplete="current-password"
          />

          <button
            disabled={pending}
            className="mt-4 w-full h-12 rounded-2xl font-medium bg-black text-white hover:brightness-110 active:scale-[.99]
                       shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
          >
            {pending ? "Signing in…" : "Continue"}
          </button>

          {msg && <p className="text-sm text-center text-amber-900/90 mt-2">{msg}</p>}

          <p className="text-sm text-center text-amber-900/90 mt-4">
            No account?{" "}
            <a className="font-medium underline underline-offset-2" href="/auth/sign-up">
              Create one
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
