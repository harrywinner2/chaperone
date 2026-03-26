const AIRTABLE_TABLE = "Members";

function corsResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Handle CORS preflight
export async function onRequestOptions() {
  return corsResponse(null, 204);
}

// Handle POST
export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return corsResponse(JSON.stringify({ error: "Invalid JSON" }), 400);
  }

  const phone = (body.phone || "").trim();

  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return corsResponse(JSON.stringify({ error: "Valid phone number required" }), 400);
  }

  // Save to Airtable
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
}
