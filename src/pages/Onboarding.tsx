import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Logo } from "@/components/agent/Logo";
import { StepProgress } from "@/components/agent/StepProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAgentStore, type Audience, type Tone } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import { Rocket, PartyPopper, DollarSign, GraduationCap, Sparkles } from "lucide-react";

const audienceOptions: { id: Audience; label: string; icon: typeof PartyPopper; emoji: string }[] = [
  { id: "hosts", label: "Event Hosts", icon: PartyPopper, emoji: "🎪" },
  { id: "sponsors", label: "Sponsors", icon: DollarSign, emoji: "💰" },
  { id: "universities", label: "Universities", icon: GraduationCap, emoji: "🎓" },
];

const toneOptions: Tone[] = ["Casual", "Professional", "Bold"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { company, city, audiences, tone, setCompany, setCity, toggleAudience, setTone } = useAgentStore();
  const [launching, setLaunching] = useState(false);

  const launch = () => {
    setLaunching(true);
    setTimeout(() => navigate("/agent"), 350);
  };

  const canLaunch = company.trim().length > 5 && city.trim().length > 1 && audiences.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container py-6 flex items-center justify-between">
        <Logo />
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
          Powered by Lynk × GrowthAgent
        </div>
      </header>

      <StepProgress current={1} />

      <main className="container flex-1 flex flex-col items-center justify-center pb-20 pt-6">
        <div className="max-w-3xl w-full text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-soft border border-primary/30 mb-8">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-foreground/80">Autonomous GTM agent · ready</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight mb-5">
            <span className="gradient-text">GrowthAgent</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Your autonomous GTM agent. Find hosts, win sponsors, grow faster.
          </p>

          <div className="glow-card p-6 sm:p-8 text-left space-y-6 animate-scale-in">
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                Describe your company
              </label>
              <Textarea
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Describe your company..."
                rows={3}
                className="bg-input/60 border-border resize-none focus-visible:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                Target city
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Target city (e.g. San Francisco)"
                className="bg-input/60 border-border focus-visible:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-3 block">
                Who should we target?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {audienceOptions.map((opt) => {
                  const active = audiences.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleAudience(opt.id)}
                      className={cn(
                        "relative rounded-xl border px-4 py-4 flex items-center gap-3 transition-smooth text-left",
                        active
                          ? "border-transparent bg-gradient-soft shadow-glow"
                          : "border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/40"
                      )}
                    >
                      {active && <div className="absolute inset-0 rounded-xl gradient-border pointer-events-none" />}
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className={cn("font-medium text-sm", active ? "text-foreground" : "text-muted-foreground")}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-3 block">Tone</label>
              <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border">
                {toneOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={cn(
                      "px-5 py-2 rounded-lg text-sm font-medium transition-smooth",
                      tone === t
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              disabled={!canLaunch || launching}
              onClick={launch}
              className={cn(
                "w-full h-14 text-base font-semibold bg-gradient-primary hover:opacity-95 text-primary-foreground border-0 shadow-elevated transition-smooth",
                launching && "animate-pulse"
              )}
            >
              <Rocket className="h-5 w-5 mr-2" />
              Launch Agent 🚀
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            The agent will scrape, enrich, score and write outreach in under 60 seconds.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
