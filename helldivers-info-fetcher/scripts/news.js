// Widgy text-data script — latest dispatch/news item.

const headers = {
  "X-Super-Client": "widgy-helldivers-widget",
  "X-Super-Contact": "Primexus",
};

const base = "https://helldiverstrainingmanual.com/api/v1";

function stripTags(text) {
  return String(text ?? "").replace(/<[^>]+>/g, "");
}

function deliver(value) {
  if (typeof sendToWidgy === "function") {
    sendToWidgy(value);
  }

  return value;
}

let output = "No recent news";

try {
  const response = await fetch(`${base}/war/news`, { headers });
  const news = await response.json();

  if (Array.isArray(news) && news.length > 0) {
    const lines = stripTags(news[news.length - 1].message || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 2);

    output = `NEWS`;
    if (lines.length > 0) {
      output += `\n${lines.join("\n")}`;
    }
  }
} catch (error) {
  output = "News fetch failed";
}

deliver(output);