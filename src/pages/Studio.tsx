import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepProgress } from "@/components/agent/StepProgress";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Copy, Sparkles, CheckCircle2, Mail, Linkedin, Instagram, Rocket, Inbox } from "lucide-react";

type Channel = "email" | "linkedin" | "instagram";

const channelMeta: Record<Channel, { label: string; icon: typeof Mail }> = {
  email: { label: "Email", icon: Mail },
  linkedin: { label: "LinkedIn DM", icon: Linkedin },
  instagram: { label: "Instagram DM", icon: Instagram },
};

const CopyableBlock = ({ text, label }: { text: string; label: string }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative bw-card p-5">
      <pre className="text-sm text-foreground/85 whitespace-pre-wrap font-sans leading-relaxed pr-10">{text}</pre>
      <Button
        size="icon"
        variant="ghost"
        onClick={onCopy}
        className="absolute top-3 right-3 h-8 w-8 hover:bg-secondary"
      >
        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

const Studio = () => {
  const navigate = useNavigate();
  const { pkg, tone } = useAgentStore();
  const { toast } = useToast();
  const [leadIdx, setLeadIdx] = useState(0);
  const [channel, setChannel] = useState<Channel>("email");

  const leads = pkg?.leads ?? [];
  const lead = leads[leadIdx];

  const currentMessage = useMemo(() => {
    if (!lead) return "";
    return channel === "email" ? lead.email : channel === "linkedin" ? lead.linkedin_dm : lead.instagram_dm;
  }, [lead, channel]);

  if (!pkg || leads.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="bg-foreground text-background">
          <div className="container py-4 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
              <span className="text-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-base tracking-tight">GrowthAgent</span>
          </div>
        </header>
        <StepProgress current={4} />
        <main className="container flex-1 flex items-center justify-center pb-20">
          <div className="bw-card p-12 max-w-md text-center">
            <Inbox className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-semibold text-lg mb-2">Nothing to show yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Run the agent first to generate outreach and content.</p>
            <Button onClick={() => navigate("/")} className="bg-foreground text-background hover:bg-foreground/90">
              Start over
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-foreground text-background">
        <div className="container py-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
            <span className="text-foreground font-bold text-sm">G</span>
          </div>
          <span className="font-bold text-base tracking-tight">GrowthAgent</span>
        </div>
      </header>
      <StepProgress current={4} />

      <main className="container flex-1 pb-32 pt-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
            Outreach & Content Studio
          </h1>
          <p className="text-muted-foreground">Review the agent's work, then launch.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* LEFT */}
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
                <Mail className="h-4 w-4 text-background" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Outreach Messages</h2>
            </div>

            <div className="bw-card p-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wide">Select a lead</label>
                <select
                  value={leadIdx}
                  onChange={(e) => setLeadIdx(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
                >
                  {leads.map((l, i) => (
                    <option key={i} value={i}>{l.name} — {l.event}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-1 p-1 rounded-xl bg-secondary border border-border">
                {(Object.keys(channelMeta) as Channel[]).map((c) => {
                  const M = channelMeta[c];
                  const active = channel === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setChannel(c)}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-smooth flex items-center justify-center gap-1.5",
                        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <M.icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{M.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <CopyableBlock text={currentMessage} label={channelMeta[channel].label} />

            <div className="bw-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4" />
                <h3 className="font-semibold text-sm">Agent Review</h3>
              </div>
              <ul className="space-y-2 text-sm text-foreground/75">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> Improved 3 emails for being too long.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> Updated tone to match {tone.toLowerCase()} preference.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> Removed generic openers, replaced with event-specific hooks.</li>
              </ul>
            </div>
          </section>

          {/* RIGHT */}
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Marketing Content</h2>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Linkedin className="h-4 w-4" /> LinkedIn Posts
              </h3>
              <div className="space-y-3">
                {pkg.linkedin_posts.map((p, i) => (
                  <CopyableBlock key={i} text={p} label="LinkedIn post" />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Instagram className="h-4 w-4" /> Instagram Captions
              </h3>
              <div className="space-y-3">
                {pkg.instagram_captions.map((p, i) => (
                  <CopyableBlock key={i} text={p} label="Instagram caption" />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Rocket className="h-4 w-4" /> Sponsor Pitch Deck Bullets
              </h3>
              <div className="bw-card p-5">
                <ul className="space-y-3">
                  {pkg.sponsor_pitch_bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground/85">
                      <span className="font-bold shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="max-w-2xl mx-auto mt-12 text-center">
          <Button
            size="lg"
            onClick={() =>
              toast({
                title: "🚀 Campaign launched!",
                description: `Sending ${leads.length} personalized messages now.`,
              })
            }
            className="w-full h-14 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 border-0 rounded-xl"
          >
            ✅ Approve & Launch Campaign 🚀
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            You can pause, edit any message, or re-run the agent any time.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Studio;
