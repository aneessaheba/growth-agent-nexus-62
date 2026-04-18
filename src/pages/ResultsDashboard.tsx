import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/agent/Logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_LABELS, Lead, LeadCategory, leadsByCategory, useAgentStore } from "@/lib/agentStore";
import { Mail, Linkedin, Instagram, FlaskConical, Check } from "lucide-react";
import { TestPitchModal } from "@/components/agent/TestPitchModal";

const ORDER: LeadCategory[] = ["customers", "sponsors", "b2b", "partners"];

const LeadCard = ({
  lead,
  approved,
  onOpen,
  onTest,
}: {
  lead: Lead;
  approved: boolean;
  onOpen: (channel: "email" | "linkedin" | "instagram") => void;
  onTest: () => void;
}) => (
  <article className="bw-card p-5 flex flex-col gap-4">
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="font-semibold text-base truncate">{lead.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{lead.company}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="text-2xl font-extrabold tabular-nums leading-none">{lead.score}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">/100</div>
      </div>
    </header>
    <p className="text-sm leading-relaxed">{lead.why_fit}</p>
    <div className="grid grid-cols-3 gap-2">
      <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={() => onOpen("email")}>
        <Mail className="h-3.5 w-3.5" /> Email
      </Button>
      <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={() => onOpen("linkedin")}>
        <Linkedin className="h-3.5 w-3.5" /> LinkedIn
      </Button>
      <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={() => onOpen("instagram")}>
        <Instagram className="h-3.5 w-3.5" /> Instagram
      </Button>
    </div>
    <Button
      size="sm"
      onClick={onTest}
      className="rounded-lg gap-2 bg-foreground text-background hover:bg-foreground/90"
    >
      {approved ? <Check className="h-3.5 w-3.5" /> : <FlaskConical className="h-3.5 w-3.5" />}
      {approved ? "Approved — Test Again" : "Test Pitch"}
    </Button>
  </article>
);

const ResultsDashboard = () => {
  const navigate = useNavigate();
  const { pkg, approvedLeadIds } = useAgentStore();
  const [tab, setTab] = useState<LeadCategory>("customers");
  const [testLead, setTestLead] = useState<Lead | null>(null);

  const grouped = useMemo(() => leadsByCategory(pkg), [pkg]);
  const total = pkg?.leads.length ?? 0;

  if (!pkg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">No pipeline results yet.</p>
        <Button onClick={() => navigate("/")} className="bg-foreground text-background hover:bg-foreground/90">Run a pipeline</Button>
      </div>
    );
  }

  const openLead = (lead: Lead, channel: "email" | "linkedin" | "instagram") => {
    navigate(`/studio?lead=${encodeURIComponent(lead.id)}&channel=${channel}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container py-5 flex items-center justify-between">
          <Logo />
          <Button
            size="sm"
            onClick={() => navigate("/studio")}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-lg"
          >
            Open Outreach Studio
          </Button>
        </div>
      </header>

      <main className="container flex-1 py-10 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">Results</h1>
          <p className="text-muted-foreground">
            {total} leads found across {ORDER.filter((k) => grouped[k].length > 0).length} pipelines.
          </p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {ORDER.map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`bw-card p-4 text-left transition-smooth ${tab === key ? "border-foreground" : ""}`}
            >
              <div className="text-3xl font-extrabold tabular-nums leading-none">{grouped[key].length}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{CATEGORY_LABELS[key]}</div>
            </button>
          ))}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as LeadCategory)}>
          <TabsList className="bg-secondary p-1 rounded-xl">
            {ORDER.map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="rounded-lg data-[state=active]:bg-foreground data-[state=active]:text-background px-4"
              >
                {CATEGORY_LABELS[key]}
                <span className="ml-2 text-xs opacity-60">{grouped[key].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {ORDER.map((key) => (
            <TabsContent key={key} value={key} className="mt-6">
              {grouped[key].length === 0 ? (
                <div className="bw-card p-10 text-center text-muted-foreground">
                  No {CATEGORY_LABELS[key].toLowerCase()} leads in this run.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[key].map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      approved={approvedLeadIds.includes(lead.id)}
                      onOpen={(ch) => openLead(lead, ch)}
                      onTest={() => setTestLead(lead)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <TestPitchModal lead={testLead} open={!!testLead} onOpenChange={(o) => !o && setTestLead(null)} />
    </div>
  );
};

export default ResultsDashboard;
