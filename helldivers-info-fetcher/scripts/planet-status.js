// Widgy text-data script — top planet status summary.

const headers = {
  "X-Super-Client": "widgy-helldivers-widget",
  "X-Super-Contact": "Primexus",
};

const base = "https://helldiverstrainingmanual.com/api/v1";

function formatPlayers(players) {
  return Number(players || 0).toLocaleString("en-US");
}

function planetLabel(planets, index) {
  const planet = planets?.[String(index)];
  return planet?.name || `Planet ${index}`;
}

function deliver(value) {
  if (typeof sendToWidgy === "function") {
    sendToWidgy(value);
  }

  return value;
}

let output = "No planet status available";

try {
  const [statusResponse, planetsResponse] = await Promise.all([
    fetch(`${base}/war/status`, { headers }),
    fetch(`${base}/planets`, { headers }),
  ]);

  const status = await statusResponse.json();
  const planets = await planetsResponse.json();
  const planetStatus = Array.isArray(status?.planetStatus) ? [...status.planetStatus] : [];

  if (planetStatus.length > 0) {
    const sorted = planetStatus
      .filter((planet) => Number(planet?.players || 0) > 0)
      .sort((left, right) => Number(right.players || 0) - Number(left.players || 0))
      .slice(0, 5);

    const totalPlayers = planetStatus.reduce((sum, planet) => sum + Number(planet?.players || 0), 0);
    const lines = sorted.map((planet) => `${planetLabel(planets, planet.index)} — ${formatPlayers(planet.players)} players`);

    output = `PLANET STATUS\nTotal players: ${formatPlayers(totalPlayers)}`;
    if (lines.length > 0) {
      output += `\n${lines.join("\n")}`;
    }
  }
} catch (error) {
  output = "Planet status fetch failed";
}

deliver(output);