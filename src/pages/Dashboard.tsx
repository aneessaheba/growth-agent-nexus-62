import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/agent/Logo";
import { StepProgress } from "@/components/agent/StepProgress";
import { Button } from "@/components/ui/button";
import { hostLeads, sponsorLeads, type HostLead, type SponsorLead } from "@/lib/agentData";
import { cn } from "@/lib/utils";
import { Mail, Linkedin, Instagram, MapPin, Users, Calendar, Wallet, ArrowRight } from "lucide-react";

type Tab = "hosts" | "sponsors";
type Filter = "all" | "high" | "medium" | "low";

const scoreBucket = (s: number): Filter => (s >= 80 ? "high" : s >= 60 ? "medium" : "low");

const ScoreBadge = ({ score }: { score: number }) => {
  const bucket = scoreBucket(score);
  const styles = {
    high: "bg-success/15 text-success border-success/30",
    medium: "bg-warning/15 text-warning border-warning/30",
    low: "bg-destructive/15 text-destructive border-destructive/30",
  }[bucket];
  return (
    <div className={cn("rounded-full border px-3 py-1 text-xs font-bold tabular-nums", styles)}>
      {score}
    </div>
  );
};

const ActionButtons = () => (
  <div className="flex gap-2 pt-1">
    <Button size="sm" variant="outline" className="flex-1 bg-muted/30 border-border hover:bg-gradient-soft hover:border-primary/40 hover:text-foreground transition-smooth">
      <Mail className="h-3.5 w-3.5 mr-1.5" /> Email
    </Button>
    <Button size="sm" variant="outline" className="flex-1 bg-muted/30 border-border hover:bg-gradient-soft hover:border-primary/40 hover:text-foreground transition-smooth">
      <Linkedin className="h-3.5 w-3.5 mr-1.5" /> LinkedIn
    </Button>
    <Button size="sm" variant="outline" className="flex-1 bg-muted/30 border-border hover:bg-gradient-soft hover:border-primary/40 hover:text-foreground transition-smooth">
      <Instagram className="h-3.5 w-3.5 mr-1.5" /> Instagram
    </Button>
  </div>
);

const HostCard = ({ lead }: { lead: HostLead }) => (
  <div className="glow-card p-5 flex flex-col gap-4 animate-fade-in-up">
    <div className="flex items-start gap-3">
      <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center font-display font-semibold text-primary-foreground shrink-0">
        {lead.avatar}
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
        <Calendar className="h-3.5 w-3.5" /> {lead.frequency}
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground truncate">
        <MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{lead.location}</span>
      </div>
    </div>

    <p className="text-sm text-foreground/75 leading-relaxed">{lead.reason}</p>
    <ActionButtons />
  </div>
);

const SponsorCard = ({ lead }: { lead: SponsorLead }) => (
  <div className="glow-card p-5 flex flex-col gap-4 animate-fade-in-up">
    <div className="flex items-start gap-3">
      <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground shrink-0">
        {lead.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{lead.company}</div>
        <div className="text-sm text-muted-foreground truncate">{lead.industry}</div>
      </div>
      <ScoreBadge score={lead.score} />
    </div>

    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border">
        <Wallet className="h-3.5 w-3.5 text-primary-glow" />
        <span className="font-medium">Budget: {lead.budget}</span>
      </div>
    </div>

    <p className="text-sm text-foreground/75 leading-relaxed">{lead.reason}</p>
    <ActionButtons />
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("hosts");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredHosts = useMemo(
    () => (filter === "all" ? hostLeads : hostLeads.filter((l) => scoreBucket(l.score) === filter)),
    [filter]
  );
  const filteredSponsors = useMemo(
    () => (filter === "all" ? sponsorLeads : sponsorLeads.filter((l) => scoreBucket(l.score) === filter)),
    [filter]
  );

  const emailsReady = hostLeads.length + sponsorLeads.length;

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "high", label: "High Score" },
    { id: "medium", label: "Medium" },
    { id: "low", label: "Low Score" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container py-6 flex items-center justify-between">
        <Logo />
        <Button
          onClick={() => navigate("/studio")}
          className="bg-gradient-primary text-primary-foreground border-0 shadow-glow hidden sm:inline-flex"
        >
          Open Studio <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </header>
      <StepProgress current={3} />

      <main className="container flex-1 pb-20 pt-6">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
            Your <span className="gradient-text">leads</span> are ready
          </h1>
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">{hostLeads.length}</span> hosts found ·{" "}
            <span className="text-foreground font-semibold">{sponsorLeads.length}</span> sponsors found ·{" "}
            <span className="text-foreground font-semibold">{emailsReady}</span> emails ready
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border">
            {(["hosts", "sponsors"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-5 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                  tab === t
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "hosts" ? "🎪 Event Hosts" : "💰 Sponsors"}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium border transition-smooth",
                filter === f.id
                  ? "bg-gradient-soft border-primary/40 text-foreground shadow-glow"
                  : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {tab === "hosts"
            ? filteredHosts.map((l) => <HostCard key={l.id} lead={l} />)
            : filteredSponsors.map((l) => <SponsorCard key={l.id} lead={l} />)}
        </div>

        <div className="text-center mt-12 sm:hidden">
          <Button
            onClick={() => navigate("/studio")}
            className="bg-gradient-primary text-primary-foreground border-0 shadow-elevated h-12 px-8"
          >
            Open Studio <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
