// Widgy text-data script — active campaign summary.

const headers = {
  "X-Super-Client": "widgy-helldivers-widget",
  "X-Super-Contact": "Primexus",
};

const base = "https://helldiverstrainingmanual.com/api/v1";

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

let output = "No active campaigns";

try {
  const response = await fetch(`${base}/war/campaign`, { headers });
  const campaigns = await response.json();

  if (Array.isArray(campaigns) && campaigns.length > 0) {
    const topCampaigns = [...campaigns]
      .sort((left, right) => Number(right.percentage || 0) - Number(left.percentage || 0))
      .slice(0, 4);

    const lines = topCampaigns.map((campaign) => {
      const status = campaign.defense ? "Defense" : "Attack";
      return `${campaign.name} — ${campaign.faction} — ${formatPercent(campaign.percentage)} ${status}`;
    });

    output = `CAMPAIGNS\n${lines.join("\n")}`;
  }
} catch (error) {
  output = "Campaign fetch failed";
}

return output;