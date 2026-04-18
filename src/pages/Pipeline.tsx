import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/agent/Logo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_PROGRESS_LABELS, LeadCategory, useAgentStore } from "@/lib/agentStore";
import { supabase } from "@/integrations/supabase/client";

type Phase = "pending" | "active" | "done";

const PIPELINES: { key: LeadCategory | "outreach"; label: string; steps: string[] }[] = [
  {
    key: "customers",
    label: "Finding Customers",
    steps: ["Reading product description", "Mapping ideal user profile", "Scanning live signal", "Scoring matches"],
  },
  {
    key: "sponsors",
    label: "Finding Sponsors",
    steps: ["Inferring audience value", "Listing sponsor categories", "Matching active brands", "Scoring fit"],
  },
  {
    key: "b2b",
    label: "Finding B2B",
    steps: ["Identifying buyer roles", "Finding teams that need this", "Enriching companies", "Scoring intent"],
  },
  {
    key: "partners",
    label: "Finding Partners",
    steps: ["Mapping adjacent communities", "Looking for co-marketing fits", "Checking integration angles", "Scoring upside"],
  },
  {
    key: "outreach",
    label: "Writing Outreach",
    steps: ["Drafting emails", "Drafting LinkedIn DMs", "Drafting Instagram DMs", "Self-reviewing tone"],
  },
];

const Pipeline = () => {
  const navigate = useNavigate();
  const { companyDescription, setPackage, setLoading, setError, pkg } = useAgentStore();
  const startedRef = useRef(false);
  const [phases, setPhases] = useState<Phase[][]>(() => PIPELINES.map((p) => p.steps.map(() => "pending" as Phase)));
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Bounce back to setup if user landed here without a description
  useEffect(() => {
    if (!companyDescription) navigate("/", { replace: true });
  }, [companyDescription, navigate]);

  useEffect(() => {
    if (startedRef.current || !companyDescription) return;
    startedRef.current = true;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Animate every pipeline's steps in parallel
    PIPELINES.forEach((pipeline, pIdx) => {
      pipeline.steps.forEach((_, sIdx) => {
        const start = (sIdx + 1) * 700 + pIdx * 120;
        timeouts.push(
          setTimeout(() => {
            if (cancelled) return;
            setPhases((prev) => {
              const next = prev.map((arr) => arr.slice());
              for (let i = 0; i < pipeline.steps.length; i++) {
                next[pIdx][i] = i < sIdx ? "done" : i === sIdx ? "active" : "pending";
              }
              return next;
            });
          }, start)
        );
        timeouts.push(
          setTimeout(() => {
            if (cancelled) return;
            setPhases((prev) => {
              const next = prev.map((arr) => arr.slice());
              next[pIdx][sIdx] = "done";
              return next;
            });
          }, start + 650)
        );
      });
    });

    // Counter animation per pipeline
    const totalMs = 4500;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / totalMs);
      const ease = 1 - Math.pow(1 - t, 3);
      setCounters({
        customers: Math.round(ease * 4),
        sponsors: Math.round(ease * 3),
        b2b: Math.round(ease * 3),
        partners: Math.round(ease * 2),
        outreach: Math.round(ease * 12),
      });
      if (t < 1 && !cancelled) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Real call
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-leads", {
          body: { companyDescription },
        });
        if (cancelled) return;
        if (error) throw new Error(error.message || "Edge function error");
        if (data?.error) throw new Error(data.error);
        if (!Array.isArray(data?.leads)) throw new Error("No leads returned");
        setPackage(data);
        setLoading(false);
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
  }, [companyDescription, setPackage, setLoading, setError]);

  // When real data lands AND animations finished, mark all done + show CTA
  useEffect(() => {
    if (!pkg) return;
    const allAnimated = phases.every((row) => row.every((p) => p === "done"));
    if (!allAnimated) return;
    // Replace counters with real numbers
    const realCounts = pkg.leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.category] = (acc[l.category] || 0) + 1;
      return acc;
    }, {});
    setCounters({
      customers: realCounts.customers || 0,
      sponsors: realCounts.sponsors || 0,
      b2b: realCounts.b2b || 0,
      partners: realCounts.partners || 0,
      outreach: pkg.leads.length * 3,
    });
    setDone(true);
  }, [pkg, phases]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container py-5 flex items-center justify-between">
          <Logo />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Pipeline</span>
        </div>
      </header>

      <main className="container flex-1 py-12 max-w-5xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">Pipeline Running</h1>
          <p className="text-muted-foreground line-clamp-2">{companyDescription}</p>
        </div>

        <div className="grid gap-4">
          {PIPELINES.map((pipeline, pIdx) => {
            const stepStates = phases[pIdx];
            const allDone = stepStates.every((s) => s === "done");
            const anyActive = stepStates.some((s) => s === "active");
            return (
              <section key={pipeline.key} className="bw-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {allDone ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                    ) : anyActive ? (
                      <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <h2 className="font-semibold text-lg">
                      {CATEGORY_PROGRESS_LABELS[pipeline.key as LeadCategory] ?? pipeline.label}
                      {anyActive && !allDone && "..."}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-extrabold tabular-nums leading-none">
                      {counters[pipeline.key] ?? 0}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                      {pipeline.key === "outreach" ? "messages" : "leads"}
                    </div>
                  </div>
                </div>
                <ol className="grid sm:grid-cols-4 gap-2">
                  {pipeline.steps.map((step, i) => {
                    const status = stepStates[i];
                    return (
                      <li
                        key={step}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-xs sm:text-sm transition-smooth",
                          status === "done" && "border-foreground bg-secondary",
                          status === "active" && "border-foreground bg-background font-medium",
                          status === "pending" && "border-border opacity-50"
                        )}
                      >
                        {step}
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>

        {errMsg && (
          <div className="mt-8 flex items-start gap-3 p-5 rounded-xl border border-foreground bg-secondary">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold mb-1">Pipeline failed</div>
              <div className="text-muted-foreground mb-3">{errMsg}</div>
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>Start over</Button>
            </div>
          </div>
        )}

        {done && !errMsg && (
          <div className="mt-10 flex justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-foreground text-background hover:bg-foreground/90 border-0 h-14 px-10 text-base font-semibold rounded-xl"
            >
              See results
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Pipeline;
