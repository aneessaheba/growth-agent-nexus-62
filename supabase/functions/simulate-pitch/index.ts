const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "Service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const mode: "simulate" | "refine" = body.mode || "simulate";
    const lead = body.lead || {};
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];

    const leadName = (lead.name || "the recipient").toString();
    const leadCompany = (lead.company || "their organization").toString();
    const leadCategory = (lead.category || "prospect").toString();
    const whyFit = (lead.why_fit || "").toString();

    let systemPrompt = "";
    let outboundMessages: ChatMessage[] = [];

    if (mode === "simulate") {
      systemPrompt = `You are ${leadName}, associated with ${leadCompany}. You receive a lot of cold emails. You are busy but care about ${leadCompany}. Context on why someone might pitch you: ${whyFit}.

Respond realistically to the cold email you just received. Be honest — sometimes interested, sometimes skeptical, sometimes blunt. Keep it to 3-6 short sentences. Ask a clarifying question or push back if something feels generic. Sign your response as ${leadName}. No emojis.`;
      outboundMessages = messages;
    } else {
      // refine
      systemPrompt = `You are GrowthAgent, a senior outbound copywriter. The user will give you the original cold email and the recipient's simulated response. Rewrite the email to address the recipient's reaction — make it sharper, more specific, and harder to ignore.

Constraints:
- 3-5 short paragraphs
- No emojis
- No fluff openers ("I hope this finds you well")
- Reference something concrete about ${leadCompany}
- Sign with "— The team"

Return ONLY the rewritten email body. No preamble, no explanation.`;
      outboundMessages = messages;
    }

    if (outboundMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: systemPrompt,
        messages: outboundMessages,
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
    const text = (data.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n")
      .trim();

    return new Response(JSON.stringify({ reply: text, category: leadCategory }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("simulate-pitch error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
