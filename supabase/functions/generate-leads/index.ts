const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are GrowthAgent, an autonomous marketing pipeline that works for ANY company.

You receive (1) a company description and (2) a list of REAL events scraped from Luma. Use the events as raw signal about who is active in the market right now. For each event, decide whether the organizer is a likely customer, sponsor, B2B prospect, or strategic partner for the described company. Then build a complete lead profile and outreach.

Always respond by calling the deliver_growth_package tool exactly once. Never write prose outside the tool call.`;

const TOOL = {
  name: "deliver_growth_package",
  description: "Deliver categorized leads plus a week of marketing content for the described company.",
  input_schema: {
    type: "object",
    properties: {
      leads: {
        type: "array",
        minItems: 6,
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Stable slug-like id, lowercase-with-dashes, unique within the response" },
            category: { type: "string", enum: ["customers", "sponsors", "b2b", "partners"] },
            name: { type: "string", description: "Full name of the person to contact" },
            company: { type: "string", description: "Company, event, or organization the person is associated with (use the real Luma event name when possible)" },
            score: { type: "integer", minimum: 50, maximum: 99 },
            why_fit: { type: "string", description: "One sentence explaining why this lead fits the described company" },
            email: { type: "string", description: "Personalized cold email, 3-5 short paragraphs, no emojis, signed '— The team'" },
            linkedin_dm: { type: "string", description: "LinkedIn DM, 2-3 conversational sentences, no emojis" },
            instagram_dm: { type: "string", description: "Instagram DM, 1-2 short casual sentences, no emojis" },
          },
          required: ["id", "category", "name", "company", "score", "why_fit", "email", "linkedin_dm", "instagram_dm"],
        },
      },
      linkedin_posts: {
        type: "array",
        minItems: 7,
        maxItems: 7,
        items: { type: "string", description: "One full LinkedIn post for the described company, no emojis" },
      },
      instagram_captions: {
        type: "array",
        minItems: 7,
        maxItems: 7,
        items: { type: "string", description: "One Instagram caption with hashtags, no emojis" },
      },
      agent_review: {
        type: "string",
        description: "2-4 sentences of honest self-review of this run for the human operator: what looks strong, what's a stretch, what to double-check before sending.",
      },
    },
    required: ["leads", "linkedin_posts", "instagram_captions", "agent_review"],
  },
};

function summarizeEvents(raw: unknown): any[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 12).map((e: any) => {
    const org = e?.organizer ?? {};
    const loc = e?.location ?? {};
    return {
      name: e?.name ?? e?.title,
      url: e?.eventUrl ?? e?.url,
      startAt: e?.startAt,
      city: loc?.city,
      venue: loc?.venueName,
      organizerName: org?.name,
      hosts: Array.isArray(e?.hosts) ? e.hosts.slice(0, 3).map((h: any) => h?.name).filter(Boolean) : undefined,
    };
  });
}

async function fetchLumaEvents(apifyToken: string): Promise<any[]> {
  const apifyUrl = `https://api.apify.com/v2/acts/hypebridge~luma-com-event-scraper/run-sync-get-dataset-items?token=${apifyToken}&timeout=120`;
  const res = await fetch(apifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startUrls: [{ url: "https://lu.ma/sf" }],
      maxItems: 12,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("Apify error", res.status, txt.slice(0, 300));
    throw new Error(`Apify scraper failed (${res.status})`);
  }
  return summarizeEvents(await res.json());
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
    const companyDescription: string = (body.companyDescription || "").toString().trim().slice(0, 2000);
    if (companyDescription.length < 10) {
      return new Response(JSON.stringify({ error: "Please describe your company in a bit more detail" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let events: any[] = [];
    try {
      events = await fetchLumaEvents(APIFY_API_KEY);
    } catch (e) {
      console.error("Luma scrape failed", e);
      return new Response(JSON.stringify({ error: "Couldn't fetch live signal right now" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (events.length === 0) {
      return new Response(JSON.stringify({ error: "No live signal found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `COMPANY DESCRIPTION:
${companyDescription}

REAL LUMA EVENTS (live signal scraped just now):
${JSON.stringify(events, null, 2)}

Build a complete marketing pipeline for this company.

For EACH event above, decide whether its organizer is a likely:
- "customers"  — end users who would directly buy/use the product
- "sponsors"   — brands/companies who would pay to be associated with this company's audience
- "b2b"        — companies who would buy this as a tool for their team
- "partners"   — orgs/communities to co-market or integrate with

Distribute leads across all four categories. If an event clearly doesn't fit any category, skip it. Aim for at least 2 leads per category when possible (8+ total). Use the REAL event/organizer name in the "company" field.

Each lead must include personalized email, LinkedIn DM, and Instagram DM that explicitly reference the event/organizer. NO EMOJIS anywhere.

Then produce 7 LinkedIn posts and 7 Instagram captions for the described company (a full week of content). NO EMOJIS.

Finish with a short, honest agent_review of the run.

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
        max_tokens: 12000,
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

    return new Response(JSON.stringify(toolUse.input), {
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
