import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Logo } from "@/components/agent/Logo";
import { StepProgress } from "@/components/agent/StepProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAgentStore, type Audience, type Tone } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";

const audienceOptions: { id: Audience; label: string; emoji: string }[] = [
  { id: "hosts", label: "Event Hosts", emoji: "🎪" },
  { id: "sponsors", label: "Sponsors", emoji: "💰" },
  { id: "universities", label: "Universities", emoji: "🎓" },
];

const toneOptions: Tone[] = ["Casual", "Professional", "Bold"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { company, city, audiences, tone, setCompany, setCity, toggleAudience, setTone } = useAgentStore();
  const [launching, setLaunching] = useState(false);

  const launch = () => {
    setLaunching(true);
    navigate("/agent");
  };

  const canLaunch = company.trim().length > 5 && city.trim().length > 1 && audiences.length > 0;

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
          <span className="text-xs opacity-70 hidden sm:inline">Powered by Lynk × GrowthAgent</span>
        </div>
      </header>

      <StepProgress current={1} />

      <main className="container flex-1 flex flex-col items-center justify-center pb-20 pt-10">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-5">
            GrowthAgent
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Your autonomous GTM agent. Find hosts, win sponsors, grow faster.
          </p>

          <div className="bw-card p-6 sm:p-8 text-left space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Describe your company</label>
              <Textarea
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Describe your company..."
                rows={3}
                className="resize-none border-border focus-visible:ring-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target city</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Target city (e.g. San Francisco)"
                className="border-border focus-visible:ring-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Who should we target?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {audienceOptions.map((opt) => {
                  const active = audiences.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleAudience(opt.id)}
                      className={cn(
                        "rounded-xl border px-4 py-3 flex items-center gap-2 transition-smooth text-left",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background hover:border-foreground"
                      )}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      <span className="font-medium text-sm">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Tone</label>
              <div className="inline-flex p-1 rounded-xl bg-secondary border border-border">
                {toneOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={cn(
                      "px-5 py-2 rounded-lg text-sm font-medium transition-smooth",
                      tone === t
                        ? "bg-foreground text-background"
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
              className="w-full h-13 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 border-0 rounded-xl"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Launch Agent 🚀
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            The agent will research, score, and write outreach in under a minute.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
