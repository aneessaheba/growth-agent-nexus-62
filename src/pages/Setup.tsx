import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/agent/Logo";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/lib/agentStore";

const EXAMPLE = "Lynk is an AI networking app that helps people connect at events";

const Setup = () => {
  const navigate = useNavigate();
  const { companyDescription, setCompanyDescription, setPackage, setError } = useAgentStore();
  const [value, setValue] = useState(companyDescription);
  const valid = value.trim().length >= 10;

  const onRun = () => {
    if (!valid) return;
    setCompanyDescription(value.trim());
    setPackage(null);
    setError(null);
    navigate("/pipeline");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container py-5">
          <Logo />
        </div>
      </header>

      <main className="container flex-1 flex items-center justify-center py-16">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">GrowthAgent</h1>
            <p className="text-lg text-muted-foreground">Your autonomous marketing pipeline</p>
          </div>

          <div className="space-y-4">
            <label htmlFor="company" className="block text-sm font-semibold">
              Describe your company and what you sell
            </label>
            <textarea
              id="company"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onRun();
              }}
              placeholder={`e.g. ${EXAMPLE}`}
              rows={5}
              className="w-full resize-none rounded-2xl border border-border bg-background px-5 py-4 text-base leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-smooth"
              maxLength={2000}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{value.length}/2000</span>
              <button
                type="button"
                onClick={() => setValue(EXAMPLE)}
                className="underline-offset-4 hover:underline"
              >
                Use example
              </button>
            </div>

            <Button
              size="lg"
              disabled={!valid}
              onClick={onRun}
              className="w-full bg-foreground text-background hover:bg-foreground/90 border-0 h-14 text-base font-semibold rounded-xl"
            >
              Run Pipeline
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Setup;
