// Widgy text-data script — "async" mode. Paste the body below (everything
// in this file) directly into the JavaScript editor on a text layer's Data
// tab. `return` sets what the layer displays.

const headers = {
  "X-Super-Client": "widgy-helldivers-widget",
  "X-Super-Contact": "Primexus", // e.g. an email or URL, per the API's request
};

const base = "https://api.helldivers2.dev/api/v1";

function formatDuration(ms) {
  if (ms <= 0) return "expired";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function stripTags(text) {
  return text.replace(/<[^>]+>/g, "");
}

let orderText = "No active Major Order";

try {
  const assignmentsRes = await fetch(`${base}/assignments`, { headers });
  const assignments = await assignmentsRes.json();

  if (assignments.length > 0) {
    const order = assignments[0];
    const remaining = formatDuration(new Date(order.expiration) - new Date());
    const briefing = stripTags(order.briefing || "");
    const shortBriefing =
      briefing.length > 90 ? `${briefing.slice(0, 87)}...` : briefing;

    orderText = `MAJOR ORDER\n${shortBriefing}\nExpires in ${remaining}`;
  }
} catch (err) {
  orderText = "Major Order fetch failed";
}

let newsText = "";

try {
  const dispatchRes = await fetch(`${base}/dispatches`, { headers });
  const dispatches = await dispatchRes.json();

  if (dispatches.length > 0) {
    const headline = stripTags(dispatches[0].message.split("\n")[0]);
    newsText = `\n\n${headline}`;
  }
} catch (err) {
  // News is a nice-to-have; skip silently if it fails.
}

return orderText + newsText;
