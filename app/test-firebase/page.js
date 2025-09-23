"use client";
import { useEffect, useState } from "react";
import { getFirebaseApp, getDb, getFirebaseAuth } from "../../lib/firebaseClient";
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function TestFirebasePage() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    async function run() {
      try {
        // Ensure app + auth
        const app = getFirebaseApp();
        const auth = getFirebaseAuth();
        const db = getDb();

        // Sign in anonymously
        const cred = await signInAnonymously(auth);
        const uid = cred.user.uid;

        // Write test doc
        const ref = doc(db, "users", uid, "test", "hello");
        await setDoc(ref, { msg: "Hello Firebase!", ts: Date.now() });

        // Read it back
        const snap = await getDoc(ref);
        setStatus(`Success ✅ Wrote and read: ${JSON.stringify(snap.data())}`);
      } catch (err) {
        console.error(err);
        setStatus("Error ❌ " + err.message);
      }
    }
    run();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Firebase Test</h1>
      <p>{status}</p>
    </div>
  );
}
