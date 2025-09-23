// Generate simple rule-based nudges from recent logs

export function getNudges(recentLogs = []) {
  if (!Array.isArray(recentLogs) || recentLogs.length === 0) {
    return [];
  }

  const nudges = [];
  const moods = recentLogs.map((l) => Number(l?.mood || 0));
  const avg = moods.reduce((a, b) => a + b, 0) / moods.length;

  if (avg < 4) {
    nudges.push("Your average mood is low. Consider a short walk or calling a friend.");
  } else if (avg > 7) {
    nudges.push("You're doing well! Reflect on what's working and keep it up.");
  } else {
    nudges.push("Stable mood. Try a new hobby or mindfulness exercise.");
  }

  const today = recentLogs[0];
  if (today && Number(today.mood) <= 3) {
    nudges.push("Tough day. Be kind to yourself and take a 5-minute breathing break.");
  }

  if (recentLogs.length >= 3) {
    const trend = Number(recentLogs[0].mood) - Number(recentLogs[2].mood);
    if (trend >= 2) nudges.push("Mood trending up. Note what changed positively.");
    if (trend <= -2) nudges.push("Mood dipped. Reduce commitments and rest.");
  }

  return nudges;
}



