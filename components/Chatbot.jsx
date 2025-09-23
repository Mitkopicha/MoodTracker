'use client';
import { useState } from 'react';

const crisisPattern = /(suicide|kill myself|harm myself|end my life|self-harm|self harm)/i;

const CRISIS_MSG =
  "I’m really sorry you’re going through this. I can’t help with crises, " +
  "but you’re not alone. If you’re in immediate danger or thinking about harming yourself, " +
  "please call your local emergency number (112 in the EU) or a trusted person right now. " +
  "You might also consider speaking to a healthcare professional or a helpline in your country.";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content:
        "You are a supportive, non-clinical assistant for a mood and habit tracker. " +
        "Offer brief, fact-based, practical suggestions about sleep, activity, daylight, social connection, and routines. " +
        "Avoid medical diagnoses or treatment. Encourage professional help when needed. Keep a warm, respectful tone.",
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    // Crisis check: respond immediately with resources
    if (crisisPattern.test(text)) {
      setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: CRISIS_MSG }]);
      setInput('');
      return;
    }

    const withUser = [...messages, { role: 'user', content: text }];
    setMessages(withUser);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: withUser }),
      });
      const { reply } = await res.json();
      if (reply) setMessages((prev) => [...prev, reply]);
      else setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I ran into an error.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="rounded border p-3 h-64 overflow-y-auto bg-gray-50 text-black">
        {messages
          .filter((m) => m.role !== 'system')
          .map((m, i) => (
            <div key={i} className="mb-2">
              <span className="font-semibold">{m.role === 'user' ? 'You' : 'Bot'}:</span>{' '}
              <span>{m.content}</span>
            </div>
          ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the bot..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="border rounded px-3 py-1 bg-blue-600 text-black disabled:opacity-50" onClick={sendMessage} disabled={busy}>
          {busy ? 'Sending…' : 'Send'}
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
  The chatbot provides general wellbeing tips only (not medical advice).
</p>

    </div>
  );
}
