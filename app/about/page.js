// app/about/page.js
export const metadata = {
  title: "About & Ethics – MoodTrack",
  description: "Disclaimer, consent, privacy, and support information for MoodTrack.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 px-4 py-6">
      <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm max-w-3xl mx-auto p-6 md:p-8 space-y-6">
        <h1 className="text-2xl font-bold">ℹ️ About &amp; Ethics</h1>

        <section>
          <h2 className="text-xl font-semibold mb-2">🌤️ What MoodTrack is (and isn’t)</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>MoodTrack helps you reflect on your mood and daily habits (sleep, activity, sunlight, social time).</li>
            <li>
              It is <strong>not</strong> a medical or crisis service and does not provide diagnosis or treatment.
            </li>
            <li>The chatbot offers only general wellbeing tips — it cannot replace professional care.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">📝 Consent &amp; Participation</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Participation is voluntary. You can stop using the app at any time.</li>
            <li>Your data can be exported or deleted in <em>Settings → Data</em>.</li>
            <li>Your Participant ID (PID) is shown in <em>Settings</em> for research use, if applicable.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">🔒 Privacy</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>
              <strong>Local-first:</strong> by default, your entries are stored only on your device (localStorage).
            </li>
            <li>
              <strong>Optional sync:</strong> if you enable Cloud Sync, your data is stored under your anonymous UID in
              Firebase Firestore (<code>users/&lt;uid&gt;/logs/&lt;date&gt;</code>).
            </li>
            <li>You can delete any synced data at any time in <em>Settings → Delete Cloud Data</em>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">🧪 Data &amp; Research Use</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Anonymous logs may be used for academic analysis, with prior ethics approval.</li>
            <li>No personal identifying information is collected or required.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">🚨 Crisis Support</h2>
          <p className="text-gray-700">
            If you are in immediate danger or thinking about harming yourself, please call your local emergency number{" "}
            (<strong>112</strong> in the EU) or seek urgent help. Consider talking to a trusted person or a healthcare
            professional.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">✉️ Contact</h2>
          <p className="text-gray-700">
            Questions about the study or the app? Please use the contact details provided in your participant information
            sheet, or the project email you were given.
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-gray-200/70 text-center text-gray-600 text-sm">
          💙 Thank you for using <span className="font-semibold">MoodTrack</span> 
        </footer>
      </div>
    </div>
  );
}
