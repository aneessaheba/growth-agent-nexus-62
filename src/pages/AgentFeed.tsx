import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/agent/Logo";
import { StepProgress } from "@/components/agent/StepProgress";
import { useAgentStore } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import { CheckCircle2, Zap, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  label: string;
  duration: number;
}

const buildSteps = (city: string): Step[] => [
  { label: "Analyzing Lynk's value proposition", duration: 900 },
  { label: "Building ideal host profile", duration: 800 },
  { label: "Building ideal sponsor profile", duration: 800 },
  { label: "Scraping Luma & Eventbrite for hosts", duration: 1100 },
  { label: `Finding event organizers in ${city}`, duration: 1000 },
  { label: "Searching for potential sponsors", duration: 1000 },
  { label: "Enriching profiles with LinkedIn data", duration: 1100 },
  { label: "Scoring all leads with AI", duration: 900 },
  { label: "Writing personalized outreach", duration: 1000 },
];

const AgentFeed = () => {
  const navigate = useNavigate();
  const { city } = useAgentStore();
  const [steps] = useState(() => buildSteps(city));
  const [activeIdx, setActiveIdx] = useState(0);
  const [hosts, setHosts] = useState(0);
  const [sponsors, setSponsors] = useState(0);
  const [emails, setEmails] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeouts: ReturnType<typeof setTimeout>[] = [];

    let cumulative = 0;
    steps.forEach((s, i) => {
      cumulative += s.duration;
      timeouts.push(
        setTimeout(() => {
          if (cancelled) return;
          setActiveIdx(i + 1);
        }, cumulative)
      );
    });

    timeouts.push(
      setTimeout(() => {
        if (!cancelled) setDone(true);
      }, cumulative + 400)
    );

    // Animate stats over the course of the run
    const total = cumulative + 400;
    const targetHosts = 24;
    const targetSponsors = 18;
    const targetEmails = 42;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / total);
      const ease = 1 - Math.pow(1 - t, 3);
      setHosts(Math.round(ease * targetHosts));
      setSponsors(Math.round(ease * targetSponsors));
      setEmails(Math.round(ease * targetEmails));
      if (t < 1 && !cancelled) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, [steps]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container py-6 flex items-center justify-between">
        <Logo />
      </header>
      <StepProgress current={2} />

      <main className="container flex-1 pb-20 pt-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-soft border border-primary/30 mb-5">
            <div className="relative">
              <Bot className="h-4 w-4 text-primary-glow" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
            <span className="text-xs font-medium">{done ? "Run complete" : "Live agent run"}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
            🤖 <span className="gradient-text">Agent Running...</span>
          </h1>
          <p className="text-muted-foreground">
            Working in {city} — this usually takes about a minute.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 animate-fade-in">
          {[
            { label: "Hosts Found", value: hosts },
            { label: "Sponsors Found", value: sponsors },
            { label: "Emails Written", value: emails },
          ].map((s) => (
            <div key={s.label} className="glow-card p-4 sm:p-5 text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold gradient-text tabular-nums">
                {s.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Log */}
        <div className="glow-card p-6 sm:p-8">
          <ul className="space-y-3">
            {steps.map((step, i) => {
              const status = i < activeIdx ? "done" : i === activeIdx ? "active" : "pending";
              return (
                <li
                  key={step.label}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border transition-smooth",
                    status === "done" && "border-success/20 bg-success/5",
                    status === "active" && "border-primary/40 bg-gradient-soft animate-fade-in",
                    status === "pending" && "border-border/50 bg-muted/20 opacity-60"
                  )}
                >
                  {status === "done" && <CheckCircle2 className="h-5 w-5 text-success shrink-0" />}
                  {status === "active" && (
                    <div className="relative shrink-0">
                      <Zap className="h-5 w-5 text-primary-glow" />
                    </div>
                  )}
                  {status === "pending" && <Loader2 className="h-5 w-5 text-muted-foreground/50 shrink-0" />}
                  <span
                    className={cn(
                      "text-sm sm:text-base",
                      status === "active" && "text-foreground font-medium",
                      status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                    {status === "active" && "..."}
                  </span>
                  {status === "active" && (
                    <span className="ml-auto flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="h-1.5 w-1.5 rounded-full bg-primary-glow animate-dot-bounce"
                          style={{ animationDelay: `${d * 0.16}s` }}
                        />
                      ))}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          {done && (
            <div className="mt-8 text-center animate-fade-in-up">
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-primary text-primary-foreground border-0 shadow-elevated h-12 px-8 text-base font-semibold"
              >
                See your leads →
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentFeed;
