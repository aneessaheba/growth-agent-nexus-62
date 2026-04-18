import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/agent/Logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Linkedin, Instagram, Check, ExternalLink, Loader2 } from "lucide-react";
import { CATEGORY_LABELS, Lead, LeadCategory, useAgentStore } from "@/lib/agentStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Channel = "email" | "linkedin" | "instagram";

const CATEGORY_ORDER: LeadCategory[] = ["customers", "sponsors", "b2b", "partners"];

const OutreachStudio = () => {
  const navigate = useNavigate();
  const { pkg, companyDescription } = useAgentStore();
  const [params, setParams] = useSearchParams();
  const [approved, setApproved] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [planUrl, setPlanUrl] = useState<string | null>(null);

  const initialLeadId = params.get("lead");
  const initialChannel = (params.get("channel") as Channel) || "email";

  const [selectedId, setSelectedId] = useState<string | null>(initialLeadId);
  const [channel, setChannel] = useState<Channel>(initialChannel);

  useEffect(() => {
    if (!pkg) return;
    if (!selectedId && pkg.leads.length > 0) {
      setSelectedId(pkg.leads[0].id);
    }
  }, [pkg, selectedId]);

  const grouped = useMemo(() => {
    const g: Record<LeadCategory, Lead[]> = { customers: [], sponsors: [], b2b: [], partners: [] };
    pkg?.leads.forEach((l) => g[l.category]?.push(l));
    return g;
  }, [pkg]);

  const selected = useMemo(() => pkg?.leads.find((l) => l.id === selectedId) ?? null, [pkg, selectedId]);

  if (!pkg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">No pipeline results yet.</p>
        <Button onClick={() => navigate("/")} className="bg-foreground text-background hover:bg-foreground/90">Run a pipeline</Button>
      </div>
    );
  }

  const messageFor = (lead: Lead, ch: Channel) =>
    ch === "email" ? lead.email : ch === "linkedin" ? lead.linkedin_dm : lead.instagram_dm;

  const onSelect = (lead: Lead) => {
    setSelectedId(lead.id);
    setParams({ lead: lead.id, channel });
  };

  const onChannel = (ch: Channel) => {
    setChannel(ch);
    if (selectedId) setParams({ lead: selectedId, channel: ch });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container py-5 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>Back to results</Button>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Outreach Studio</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* LEFT: lead picker */}
          <aside className="lg:col-span-3">
            <div className="bw-card p-3 max-h-[70vh] overflow-y-auto">
              {CATEGORY_ORDER.map((cat) => (
                <div key={cat} className="mb-3 last:mb-0">
                  <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {CATEGORY_LABELS[cat]} · {grouped[cat].length}
                  </div>
                  <ul>
                    {grouped[cat].map((lead) => (
                      <li key={lead.id}>
                        <button
                          onClick={() => onSelect(lead)}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-smooth ${
                            selectedId === lead.id
                              ? "border-foreground bg-secondary"
                              : "border-transparent hover:border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm truncate">{lead.name}</span>
                            <span className="text-xs tabular-nums text-muted-foreground shrink-0">{lead.score}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{lead.company}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* CENTER: outreach for selected */}
          <section className="lg:col-span-5">
            {selected ? (
              <div className="bw-card p-6">
                <header className="mb-5">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {CATEGORY_LABELS[selected.category]}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">{selected.company}</p>
                  <p className="text-sm mt-3">{selected.why_fit}</p>
                </header>

                <Tabs value={channel} onValueChange={(v) => onChannel(v as Channel)}>
                  <TabsList className="bg-secondary p-1 rounded-xl mb-4">
                    <TabsTrigger value="email" className="rounded-lg gap-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="rounded-lg gap-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </TabsTrigger>
                    <TabsTrigger value="instagram" className="rounded-lg gap-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background">
                      <Instagram className="h-3.5 w-3.5" /> Instagram
                    </TabsTrigger>
                  </TabsList>
                  {(["email", "linkedin", "instagram"] as Channel[]).map((ch) => (
                    <TabsContent key={ch} value={ch}>
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-secondary rounded-xl p-5 border border-border">
{messageFor(selected, ch)}
                      </pre>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            ) : (
              <div className="bw-card p-10 text-center text-muted-foreground">Select a lead to view outreach.</div>
            )}
          </section>

          {/* RIGHT: marketing content */}
          <aside className="lg:col-span-4">
            <div className="bw-card p-5 mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">
                Week of LinkedIn posts
              </h3>
              <ol className="space-y-3">
                {pkg.linkedin_posts.map((post, i) => (
                  <li key={i} className="border-l-2 border-foreground pl-3 text-sm">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Day {i + 1}</div>
                    <p className="whitespace-pre-wrap leading-relaxed">{post}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bw-card p-5">
              <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">
                Week of Instagram captions
              </h3>
              <ol className="space-y-3">
                {pkg.instagram_captions.map((cap, i) => (
                  <li key={i} className="border-l-2 border-foreground pl-3 text-sm">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Day {i + 1}</div>
                    <p className="whitespace-pre-wrap leading-relaxed">{cap}</p>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        {/* Bottom: agent self-review + approve */}
        <section className="bw-card mt-8 p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Agent self-review</h3>
              <p className="text-sm leading-relaxed">{pkg.agent_review}</p>
            </div>
            <Button
              size="lg"
              onClick={async () => {
                if (approved || launching) return;
                setLaunching(true);
                try {
                  const { data, error } = await supabase.functions.invoke("create-roryplan", {
                    body: {
                      companyName: companyDescription.slice(0, 80) || "Untitled",
                      leads: pkg.leads.map((l) => ({ id: l.id, name: l.name, company: l.company })),
                    },
                  });
                  if (error) throw error;
                  if (data?.error) throw new Error(data.error);
                  setApproved(true);
                  setPlanUrl(data?.url ?? null);
                  toast({
                    title: "Campaign plan created in RoryPlans",
                    description: `${data?.taskCount ?? "All"} tasks scheduled.`,
                  });
                } catch (e) {
                  toast({
                    title: "Couldn't create RoryPlans campaign",
                    description: e instanceof Error ? e.message : "Try again",
                    variant: "destructive",
                  });
                } finally {
                  setLaunching(false);
                }
              }}
              disabled={approved || launching}
              className="bg-foreground text-background hover:bg-foreground/90 border-0 h-12 px-8 rounded-xl font-semibold gap-2 shrink-0"
            >
              {launching ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Launching campaign...</>
              ) : approved ? (
                <><Check className="h-4 w-4" /> Approved</>
              ) : (
                "Approve All"
              )}
            </Button>
          </div>

          {approved && (
            <div className="mt-6 border border-foreground rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-secondary">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">RoryPlans</div>
                <p className="text-base font-semibold">Campaign plan created in RoryPlans</p>
                <p className="text-sm text-muted-foreground">
                  All leads and content tasks have been scheduled.
                </p>
              </div>
              {planUrl && (
                <a
                  href={planUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold transition-smooth"
                >
                  View plan <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default OutreachStudio;
