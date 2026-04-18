import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepProgress } from "@/components/agent/StepProgress";
import { Button } from "@/components/ui/button";
import { useAgentStore, type Lead } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import { Mail, Linkedin, Instagram, Users, ArrowRight, Inbox } from "lucide-react";

type Filter = "all" | "high" | "medium" | "low";
const scoreBucket = (s: number): Filter => (s >= 80 ? "high" : s >= 60 ? "medium" : "low");

const ScoreBadge = ({ score }: { score: number }) => (
  <div className="rounded-full border border-foreground px-3 py-1 text-xs font-bold tabular-nums bg-foreground text-background">
    {score}
  </div>
);

const formatNum = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return n.toString();
};

const LeadCard = ({ lead }: { lead: Lead }) => {
  const initials = lead.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="bw-card p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-xl bg-foreground flex items-center justify-center font-semibold text-background shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{lead.name}</div>
          <div className="text-sm text-muted-foreground truncate">{lead.event}</div>
        </div>
        <ScoreBadge score={lead.score} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> {lead.attendees}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Linkedin className="h-3.5 w-3.5" /> {formatNum(lead.linkedin_connections)}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Instagram className="h-3.5 w-3.5" /> {formatNum(lead.instagram_followers)}
        </div>
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed">{lead.why_fit}</p>

      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" className="flex-1 border-border hover:bg-foreground hover:text-background hover:border-foreground transition-smooth">
          <Mail className="h-3.5 w-3.5 mr-1.5" /> Email
        </Button>
        <Button size="sm" variant="outline" className="flex-1 border-border hover:bg-foreground hover:text-background hover:border-foreground transition-smooth">
          <Linkedin className="h-3.5 w-3.5 mr-1.5" /> LinkedIn
        </Button>
        <Button size="sm" variant="outline" className="flex-1 border-border hover:bg-foreground hover:text-background hover:border-foreground transition-smooth">
          <Instagram className="h-3.5 w-3.5 mr-1.5" /> Insta
        </Button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { pkg } = useAgentStore();
  const [filter, setFilter] = useState<Filter>("all");

  const leads = pkg?.leads ?? [];
  const filtered = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => scoreBucket(l.score) === filter)),
    [filter, leads]
  );

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "high", label: "High Score" },
    { id: "medium", label: "Medium" },
    { id: "low", label: "Low Score" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-foreground text-background">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
              <span className="text-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-base tracking-tight">GrowthAgent</span>
          </div>
          <Button
            onClick={() => navigate("/studio")}
            className="bg-background text-foreground hover:bg-background/90 border-0 hidden sm:inline-flex h-9"
          >
            Open Studio <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </header>
      <StepProgress current={3} />

      <main className="container flex-1 pb-20 pt-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
            Your leads are ready
          </h1>
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">{leads.length}</span> hosts found ·{" "}
            <span className="text-foreground font-semibold">{leads.length}</span> emails ready ·{" "}
            <span className="text-foreground font-semibold">{leads.length * 2}</span> DMs drafted
          </p>
        </div>

        {leads.length === 0 ? (
          <div className="bw-card p-12 max-w-md mx-auto text-center">
            <Inbox className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-semibold text-lg mb-2">No leads yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Run the agent first to see results here.</p>
            <Button onClick={() => navigate("/")} className="bg-foreground text-background hover:bg-foreground/90">
              Start over
            </Button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-medium border transition-smooth",
                    filter === f.id
                      ? "bg-foreground border-foreground text-background"
                      : "bg-background border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
              {filtered.map((l, i) => <LeadCard key={i} lead={l} />)}
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={() => navigate("/studio")}
                className="bg-foreground text-background hover:bg-foreground/90 border-0 h-12 px-8 rounded-xl"
              >
                Open Studio <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
