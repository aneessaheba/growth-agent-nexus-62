import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/agent/Logo";
import { StepProgress } from "@/components/agent/StepProgress";
import { useAgentStore } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const buildSteps = (city: string) => [
  "Analyzing company value proposition",
  "Building ideal host profile",
  "Building ideal sponsor profile",
  "Scraping Luma & Eventbrite for hosts",
  `Finding event organizers in ${city}`,
  "Searching for potential sponsors",
  "Enriching profiles with LinkedIn data",
  "Scoring all leads with AI",
  "Writing personalized outreach",
];

const AgentFeed = () => {
  const navigate = useNavigate();
  const { company, city, tone, audiences, setPackage, setLoading, setError } = useAgentStore();
  const [steps] = useState(() => buildSteps(city));
  const [activeIdx, setActiveIdx] = useState(0);
  const [leadsFound, setLeadsFound] = useState(0);
  const [done, setDone] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    const stepDelay = 1000;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Animate steps one per second
    steps.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => {
          if (!cancelled) setActiveIdx(i + 1);
        }, (i + 1) * stepDelay)
      );
    });

    // Animate leads counter 0 → 8 over the run duration
    const totalMs = steps.length * stepDelay;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / totalMs);
      const ease = 1 - Math.pow(1 - t, 3);
      setLeadsFound(Math.round(ease * 8));
      if (t < 1 && !cancelled) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Kick off real Claude call in parallel
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-leads", {
          body: { company, city, tone, audiences },
        });
        if (cancelled) return;
        if (error) throw new Error(error.message || "Edge function error");
        if (data?.error) throw new Error(data.error);
        if (!data?.leads) throw new Error("No leads returned");
        setPackage(data);
        setLoading(false);
        // Wait for animation to finish before showing done
        const elapsed = performance.now() - start;
        const remaining = Math.max(0, totalMs + 400 - elapsed);
        timeouts.push(setTimeout(() => {
          if (!cancelled) {
            setLeadsFound(8);
            setDone(true);
          }
        }, remaining));
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("generate-leads failed", e);
        setError(msg);
        setErrMsg(msg);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, [steps, company, city, tone, audiences, setPackage, setLoading, setError]);

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
        </div>
      </header>
      <StepProgress current={2} />

      <main className="container flex-1 pb-20 pt-10 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
            🤖 Agent Running...
          </h1>
          <p className="text-muted-foreground">
            Working in {city} — this usually takes about a minute.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[
            { label: "Leads Found", value: leadsFound },
            { label: "Emails Written", value: leadsFound },
            { label: "DMs Drafted", value: leadsFound * 2 },
          ].map((s) => (
            <div key={s.label} className="bw-card p-4 sm:p-5 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold tabular-nums">{s.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Log */}
        <div className="bw-card p-4 sm:p-6">
          <ul className="space-y-2">
            {steps.map((step, i) => {
              const status = i < activeIdx ? "done" : i === activeIdx ? "active" : "pending";
              return (
                <li
                  key={step}
                  className={cn(
                    "flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg border transition-smooth",
                    status === "done" && "border-foreground bg-secondary",
                    status === "active" && "border-foreground bg-background",
                    status === "pending" && "border-border bg-background opacity-50"
                  )}
                >
                  {status === "done" && <CheckCircle2 className="h-5 w-5 text-foreground shrink-0" />}
                  {status === "active" && (
                    <Loader2 className="h-5 w-5 text-foreground shrink-0 animate-spin" />
                  )}
                  {status === "pending" && (
                    <div className="h-5 w-5 rounded-full border-2 border-border shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-sm sm:text-base",
                      status === "active" && "font-medium",
                      status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {step}{status === "active" && "..."}
                  </span>
                </li>
              );
            })}
          </ul>

          {errMsg && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-lg border border-foreground bg-secondary">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold mb-1">Agent failed</div>
                <div className="text-muted-foreground">{errMsg}</div>
              </div>
            </div>
          )}

          {done && !errMsg && (
            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="bg-foreground text-background hover:bg-foreground/90 border-0 h-12 px-8 text-base font-semibold rounded-xl"
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
