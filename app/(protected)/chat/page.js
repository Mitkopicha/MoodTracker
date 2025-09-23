// app/chat/page.js

import Chatbot from "../../components/Chatbot.jsx";

export const metadata = {
  title: "Chatbot – MoodTrack",
  description: "A simple, supportive chatbot for reflection and wellbeing tips.",
};

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Intro */}
        <div className="text rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-5 space-y-2">
          <h1 className="text-center text-2xl font-bold">Supportive Chatbot</h1>
          <p className="text-sm text-gray-600">
            This chatbot gives simple, supportive ideas to reflect on your habits and mood.
            It’s not a medical or crisis service.
          </p>

          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Get tips for improving sleep, steps, sunlight, or social time.</li>
            <li>Reflect on your daily mood and track small habits.</li>
            <li>Explore healthy routines or motivation ideas.</li>
          </ul>
        </div>

        {/* Chat area */}
        <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-0">
          <Chatbot />
        </div>

        {/* Example prompts */}
        <div className="text-center text-gray-600 text-xs">
          💬 Try asking:  
          <span className="block mt-1">“How can I get better sleep?”</span>
          <span className="block">“Give me a small step goal.”</span>
          <span className="block">“Ideas for social breaks during study?”</span>
        </div>
      </div>
    </div>
  );
}
