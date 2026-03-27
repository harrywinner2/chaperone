const AIRTABLE_TABLE = "Visitors";

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
  } catch (e) {
    console.error("JSON parse error:", e.message);
    return corsResponse(
      JSON.stringify({ 
        error: "Invalid request format",
        debugInfo: {
          errorType: "JSON_PARSE_ERROR",
          timestamp: new Date().toISOString()
        }
      }), 
      400
    );
  }

  const phone = (body.phone || "").trim();

  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return corsResponse(JSON.stringify({ error: "Valid phone number required" }), 400);
  }

  // Validate environment variables
  if (!env.AIRTABLE_BASE_ID || !env.AIRTABLE_API_KEY) {
    console.error("Missing Airtable credentials");
    return corsResponse(
      JSON.stringify({ 
        error: "Service configuration error. Please contact support.",
        debugInfo: {
          errorType: "MISSING_CREDENTIALS",
          missingVars: {
            baseId: !env.AIRTABLE_BASE_ID,
            apiKey: !env.AIRTABLE_API_KEY
          },
          timestamp: new Date().toISOString()
        }
      }), 
      500
    );
  }

  // Save to Airtable with error handling
  try {
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
            "Status":    "Pending",
            "Source":    request.headers.get("Referer") || "direct",
          },
        }),
      }
    );

    if (!airtableRes.ok) {
      const err = await airtableRes.text();
      console.error("Airtable error:", airtableRes.status, err);
      
      // Provide more specific error messages
      let errorMessage = "Unable to save your submission. Please try again.";
      let errorType = "AIRTABLE_ERROR";
      
      if (airtableRes.status === 401 || airtableRes.status === 403) {
        errorMessage = "Authentication error. Please contact support.";
        errorType = "AIRTABLE_AUTH_ERROR";
      } else if (airtableRes.status === 422) {
        errorMessage = "Invalid data format. Please check your phone number.";
        errorType = "AIRTABLE_VALIDATION_ERROR";
      }
      
      return corsResponse(
        JSON.stringify({ 
          error: errorMessage,
          debugInfo: {
            errorType,
            statusCode: airtableRes.status,
            timestamp: new Date().toISOString()
          }
        }), 
        airtableRes.status
      );
    }

    return corsResponse(JSON.stringify({ ok: true }), 200);
    
  } catch (e) {
    console.error("Network or unexpected error:", e.message, e.stack);
    return corsResponse(
      JSON.stringify({ 
        error: "Network error. Please check your connection and try again.",
        debugInfo: {
          errorType: "NETWORK_ERROR",
          errorMessage: e.message,
          timestamp: new Date().toISOString()
        }
      }), 
      503
    );
  }
}
