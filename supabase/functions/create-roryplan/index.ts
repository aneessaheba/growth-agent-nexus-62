const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Lead {
  id?: string;
  name: string;
  company: string;
}

interface Payload {
  companyName: string;
  leads: Lead[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const RORYPLANS_API_KEY = Deno.env.get("RORYPLANS_API_KEY");
    if (!RORYPLANS_API_KEY) {
      console.error("RORYPLANS_API_KEY not set");
      return new Response(JSON.stringify({ error: "RoryPlans not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: Payload = await req.json().catch(() => ({ companyName: "", leads: [] }));
    const companyName = (body.companyName || "Untitled").toString().slice(0, 200);
    const leads = Array.isArray(body.leads) ? body.leads : [];

    if (leads.length === 0) {
      return new Response(JSON.stringify({ error: "No leads to schedule" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tasks: string[] = [];
    for (const lead of leads) {
      const label = `${lead.name} - ${lead.company}`.slice(0, 200);
      tasks.push(`Email ${label}`);
      tasks.push(`Follow up ${lead.name} - 3 days later`);
    }
    tasks.push("Post LinkedIn content - Day 1");
    tasks.push("Post LinkedIn content - Day 3");
    tasks.push("Post LinkedIn content - Day 5");

    const planBody = {
      title: `GrowthAgent Campaign - ${companyName}`,
      tasks,
    };

    const roryRes = await fetch("https://roryplans.ai/api/plans", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RORYPLANS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planBody),
    });

    const text = await roryRes.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { /* keep as text */ }

    if (!roryRes.ok) {
      console.error("RoryPlans error", roryRes.status, text.slice(0, 500));
      return new Response(JSON.stringify({ error: `RoryPlans rejected the plan (${roryRes.status})` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to extract a viewable URL from common response shapes
    const planId = data?.id ?? data?.plan?.id ?? data?.planId ?? null;
    const planUrl =
      data?.url ??
      data?.plan?.url ??
      data?.viewUrl ??
      (planId ? `https://roryplans.ai/plans/${planId}` : "https://roryplans.ai");

    return new Response(JSON.stringify({ url: planUrl, id: planId, taskCount: tasks.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-roryplan error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
