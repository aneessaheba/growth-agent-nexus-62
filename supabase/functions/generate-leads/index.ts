const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are GrowthAgent, an autonomous GTM agent for Lynk — an AI networking app that turns event intros into long-term relationships.

You are given REAL events scraped from Luma. For each event, generate a realistic lead profile for the event organizer. Use plausible follower/connection numbers. Personalize copy by referencing the actual event name.

Always respond by calling the provided tool exactly once. Never include prose outside the tool call.`;

const TOOL = {
  name: "deliver_growth_package",
  description: "Deliver leads (built from real scraped events) plus marketing content.",
  input_schema: {
    type: "object",
    properties: {
      leads: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Full name of the event organizer" },
            event: { type: "string", description: "Real event name from the scraped data" },
            attendees: { type: "integer", minimum: 20, maximum: 2000 },
            linkedin_connections: { type: "integer", minimum: 500, maximum: 30000 },
            instagram_followers: { type: "integer", minimum: 200, maximum: 100000 },
            score: { type: "integer", minimum: 50, maximum: 98 },
            why_fit: { type: "string", description: "One sentence on why they fit Lynk" },
            email: { type: "string", description: "Personalized cold email referencing the specific event, 3-5 short paragraphs, signed '— The Lynk team'" },
            linkedin_dm: { type: "string", description: "LinkedIn DM, 2-3 sentences, conversational, references the event" },
            instagram_dm: { type: "string", description: "Instagram DM, 1-2 short sentences, very casual, lowercase ok" },
            type: { type: "string", enum: ["host", "sponsor"] },
          },
          required: ["name", "event", "attendees", "linkedin_connections", "instagram_followers", "score", "why_fit", "email", "linkedin_dm", "instagram_dm", "type"],
        },
      },
      linkedin_posts: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
      instagram_captions: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
      sponsor_pitch_bullets: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: { type: "string" },
      },
    },
    required: ["leads", "linkedin_posts", "instagram_captions", "sponsor_pitch_bullets"],
  },
};

// Trim Apify event payloads down so we don't blow Claude's context window
function summarizeEvents(raw: unknown): any[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 8).map((e: any) => {
    const org = e?.organizer ?? {};
    const loc = e?.location ?? {};
    return {
      name: e?.name ?? e?.title,
      url: e?.eventUrl ?? e?.url,
      startAt: e?.startAt,
      city: loc?.city,
      venue: loc?.venueName,
      organizerName: org?.name,
      organizerInstagram: org?.instagram ?? null,
      organizerLinkedin: org?.linkedin ?? null,
      organizerTwitter: org?.twitter ?? null,
      hosts: Array.isArray(e?.hosts) ? e.hosts.slice(0, 3).map((h: any) => h?.name).filter(Boolean) : undefined,
    };
  });
}

async function fetchLumaEvents(apifyToken: string, city: string): Promise<any[]> {
  const url = `https://lu.ma/${city.toLowerCase().replace(/\s+/g, "-")}`;
  const apifyUrl = `https://api.apify.com/v2/acts/hypebridge~luma-com-event-scraper/run-sync-get-dataset-items?token=${apifyToken}&timeout=120`;
  const res = await fetch(apifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startUrls: [{ url }],
      maxItems: 8,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("Apify error", res.status, txt.slice(0, 300));
    throw new Error(`Apify scraper failed (${res.status})`);
  }
  const data = await res.json();
  return summarizeEvents(data);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const APIFY_API_KEY = Deno.env.get("APIFY_API_KEY");
    if (!ANTHROPIC_API_KEY || !APIFY_API_KEY) {
      console.error("Missing API key", { hasAnthropic: !!ANTHROPIC_API_KEY, hasApify: !!APIFY_API_KEY });
      return new Response(JSON.stringify({ error: "Service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const company: string = (body.company || "Lynk — an AI networking app that turns event intros into long-term relationships.").toString().slice(0, 1000);
    const city: string = (body.city || "sf").toString().slice(0, 100);
    const tone: string = (body.tone || "Casual").toString().slice(0, 30);
    const audiences: string[] = Array.isArray(body.audiences) ? body.audiences.slice(0, 5) : ["hosts", "sponsors"];

    // STEP 1: Scrape real events from Luma via Apify
    let events: any[] = [];
    try {
      events = await fetchLumaEvents(APIFY_API_KEY, city);
    } catch (e) {
      console.error("Luma scrape failed", e);
      return new Response(JSON.stringify({ error: "Couldn't fetch live events right now" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (events.length === 0) {
      return new Response(JSON.stringify({ error: "No events found for this city" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 2: Send real events to Claude
    const userPrompt = `Generate a complete GrowthAgent package using REAL scraped events.

COMPANY: ${company}
TARGET CITY: ${city}
AUDIENCES: ${audiences.join(", ")}
TONE: ${tone}

REAL LUMA EVENTS (scraped just now):
${JSON.stringify(events, null, 2)}

For EACH of the ${events.length} events above, build one lead for the event organizer:
- name: organizer's full name (use the host field if present, else invent a plausible one)
- event: use the EXACT event name from the scraped data
- attendees: estimate based on the event style and any guestCount signal
- linkedin_connections + instagram_followers: realistic estimates for an organizer of this kind of event
- score: 60-98 based on fit for Lynk (community building, recurring events, networking-heavy → higher)
- why_fit: one sentence
- email: personalized cold email that references the specific event by name (3-5 short paragraphs, signed "— The Lynk team")
- linkedin_dm: 2-3 conversational sentences referencing the event
- instagram_dm: 1-2 casual sentences, lowercase ok
- type: "host" or "sponsor"

Tone of all written messages must be ${tone}.

Then produce 3 LinkedIn posts for ${company}, 3 Instagram captions (with hashtags), and 5 punchy sponsor pitch bullets.

Call the deliver_growth_package tool exactly once.`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        tools: [TOOL],
        tool_choice: { type: "tool", name: "deliver_growth_package" },
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic error", anthropicRes.status, errText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await anthropicRes.json();
    const toolUse = (data.content || []).find((b: any) => b.type === "tool_use");
    if (!toolUse?.input) {
      console.error("No tool_use block in response", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "Model did not return structured output" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 3: Return real-data package to the frontend (include raw events for transparency)
    return new Response(JSON.stringify({ ...toolUse.input, source_events: events }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-leads error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
