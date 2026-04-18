import { corsHeaders } from "@supabase/supabase-js/cors";

const SYSTEM_PROMPT = `You are GrowthAgent, an autonomous GTM agent for Lynk — an AI networking app that turns event intros into long-term relationships.

You generate REALISTIC, plausible leads and marketing content. Use real-sounding names, plausible event names, realistic numbers. Never invent obviously fake data.

Always respond by calling the provided tool exactly once. Never include prose outside the tool call.`;

const TOOL = {
  name: "deliver_growth_package",
  description: "Deliver the complete set of leads and marketing content for the GrowthAgent run.",
  input_schema: {
    type: "object",
    properties: {
      leads: {
        type: "array",
        minItems: 8,
        maxItems: 8,
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Full name of the event organizer" },
            event: { type: "string", description: "Name of the event they organize" },
            attendees: { type: "integer", minimum: 100, maximum: 500 },
            linkedin_connections: { type: "integer", minimum: 500, maximum: 30000 },
            instagram_followers: { type: "integer", minimum: 200, maximum: 100000 },
            score: { type: "integer", minimum: 0, maximum: 100 },
            why_fit: { type: "string", description: "One sentence on why they fit Lynk" },
            email: { type: "string", description: "Personalized cold email, 3-5 short paragraphs, signed '— The Lynk team'" },
            linkedin_dm: { type: "string", description: "LinkedIn DM, 2-3 sentences, conversational" },
            instagram_dm: { type: "string", description: "Instagram DM, 1-2 short sentences, very casual, lowercase ok" },
          },
          required: ["name", "event", "attendees", "linkedin_connections", "instagram_followers", "score", "why_fit", "email", "linkedin_dm", "instagram_dm"],
        },
      },
      linkedin_posts: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string", description: "A complete LinkedIn post for Lynk, including hook + body" },
      },
      instagram_captions: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string", description: "Instagram caption with line breaks and hashtags" },
      },
      sponsor_pitch_bullets: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: { type: "string", description: "A single concise pitch bullet to a sponsor" },
      },
    },
    required: ["leads", "linkedin_posts", "instagram_captions", "sponsor_pitch_bullets"],
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const company: string = (body.company || "Lynk — an AI networking app that turns event intros into long-term relationships.").toString().slice(0, 1000);
    const city: string = (body.city || "San Francisco").toString().slice(0, 100);
    const tone: string = (body.tone || "Casual").toString().slice(0, 30);
    const audiences: string[] = Array.isArray(body.audiences) ? body.audiences.slice(0, 5) : ["hosts", "sponsors"];

    const userPrompt = `Generate a complete GrowthAgent package for this run.

COMPANY: ${company}
TARGET CITY: ${city}
AUDIENCES: ${audiences.join(", ")}
TONE: ${tone}

Generate exactly 8 realistic event organizer leads in ${city} who would benefit from Lynk. Mix high (85-98), medium (65-84), and lower (50-64) scores so the dashboard feels real. Make events varied: AI mixers, founder dinners, demo nights, women-in-tech brunches, hacker houses, design meetups, etc. Use realistic, diverse full names. Use plausible follower/connection counts.

Tone of all written messages must be ${tone}. Personalize each email, LinkedIn DM, and Instagram DM to the specific organizer and their event — reference their event name explicitly.

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
      return new Response(JSON.stringify({ error: `Anthropic API error (${anthropicRes.status})`, details: errText.slice(0, 500) }), {
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
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
