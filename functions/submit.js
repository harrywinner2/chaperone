// Chaperone — Cloudflare Worker
// Proxies phone number submissions to Airtable
// Deploy at: Cloudflare Dashboard → Workers → Create Worker
//
// Environment variables to set in Cloudflare (Workers → Settings → Variables):
//   AIRTABLE_API_KEY  →  your Airtable personal access token
//   AIRTABLE_BASE_ID  →  your Airtable base ID

const AIRTABLE_TABLE = "Members";

export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return corsResponse(null, 204);
    }

    // Only accept POST
    if (request.method !== "POST") {
      return corsResponse(JSON.stringify({ error: "Method not allowed" }), 405);
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse(JSON.stringify({ error: "Invalid JSON" }), 400);
    }

    const phone = (body.phone || "").trim();

    // Basic validation
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return corsResponse(JSON.stringify({ error: "Valid phone number required" }), 400);
    }

    // Post to Airtable
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "Phone":     phone,
            "Submitted": new Date().toISOString(),
            "Status":    "New",
            "Source":    request.headers.get("Referer") || "direct",
          },
        }),
      }
    );

    if (!airtableRes.ok) {
      const err = await airtableRes.text();
      console.error("Airtable error:", err);
      return corsResponse(JSON.stringify({ error: "Failed to save — try again" }), 502);
    }

    return corsResponse(JSON.stringify({ ok: true }), 200);
  },
};

function corsResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type":                "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
