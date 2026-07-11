// Widgy text-data script — major order only.

const headers = {
  "X-Super-Client": "widgy-helldivers-widget",
  "X-Super-Contact": "Primexus",
};

const base = "https://helldiverstrainingmanual.com/api/v1";

function formatDuration(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function stripTags(text) {
  return String(text ?? "").replace(/<[^>]+>/g, "");
}

let output = "No active Major Order";

try {
  const response = await fetch(`${base}/war/major-orders`, { headers });
  const orders = await response.json();

  if (Array.isArray(orders) && orders.length > 0) {
    const order = orders[0];
    const title = order.setting?.overrideTitle || "MAJOR ORDER";
    const briefing = stripTags(order.setting?.overrideBrief || order.setting?.taskDescription || "");
    const shortBriefing = briefing.length > 90 ? `${briefing.slice(0, 87)}...` : briefing;
    const rewardAmount = order.setting?.reward?.amount;

    output = `${title}\n${shortBriefing}\nExpires in ${formatDuration(order.expiresIn)}`;

    if (rewardAmount != null) {
      output += `\nReward: ${rewardAmount} medals`;
    }
  }
} catch (error) {
  output = "Major Order fetch failed";
}

return output;