import { useMemo, useState } from "react";
import { Logo } from "@/components/agent/Logo";
import { StepProgress } from "@/components/agent/StepProgress";
import { Button } from "@/components/ui/button";
import { hostLeads, sponsorLeads, buildOutreach, linkedinPosts, instagramCaptions, sponsorPitchBullets } from "@/lib/agentData";
import { useAgentStore } from "@/lib/agentStore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Copy, Sparkles, CheckCircle2, Mail, Linkedin, Instagram, Rocket } from "lucide-react";

type Channel = "email" | "linkedin" | "instagram";

const channelMeta: Record<Channel, { label: string; icon: typeof Mail; emoji: string }> = {
  email: { label: "Email", icon: Mail, emoji: "✉️" },
  linkedin: { label: "LinkedIn DM", icon: Linkedin, emoji: "💼" },
  instagram: { label: "Instagram DM", icon: Instagram, emoji: "📸" },
};

const allLeads = [
  ...hostLeads.map((h) => ({ id: h.id, label: `${h.name} — ${h.event}`, name: h.name })),
  ...sponsorLeads.map((s) => ({ id: s.id, label: `${s.company} (sponsor)`, name: s.company })),
];

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
    <div className="relative group glow-card p-5">
      <pre className="text-sm text-foreground/85 whitespace-pre-wrap font-sans leading-relaxed pr-10">{text}</pre>
      <Button
        size="icon"
        variant="ghost"
        onClick={onCopy}
        className="absolute top-3 right-3 h-8 w-8 hover:bg-primary/15 hover:text-primary-glow"
      >
        {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

const Studio = () => {
  const { tone } = useAgentStore();
  const { toast } = useToast();
  const [leadId, setLeadId] = useState(allLeads[0].id);
  const [channel, setChannel] = useState<Channel>("email");

  const lead = allLeads.find((l) => l.id === leadId)!;
  const messages = useMemo(() => buildOutreach(lead.name, tone), [lead, tone]);
  const currentMessage = channel === "email" ? messages.email : channel === "linkedin" ? messages.linkedin : messages.instagram;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container py-6 flex items-center justify-between">
        <Logo />
      </header>
      <StepProgress current={4} />

      <main className="container flex-1 pb-32 pt-6">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
            Outreach &amp; <span className="gradient-text">Content Studio</span>
          </h1>
          <p className="text-muted-foreground">Review the agent's work, then launch.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* LEFT: Outreach */}
          <section className="space-y-5 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold">Outreach Messages</h2>
            </div>

            <div className="glow-card p-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wide">Select a lead</label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full bg-input/60 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {allLeads.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-1 p-1 rounded-xl bg-muted/40 border border-border">
                {(Object.keys(channelMeta) as Channel[]).map((c) => {
                  const M = channelMeta[c];
                  const active = channel === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setChannel(c)}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-smooth flex items-center justify-center gap-1.5",
                        active
                          ? "bg-gradient-primary text-primary-foreground shadow-glow"
                          : "text-muted-foreground hover:text-foreground"
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

            <div className="glow-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary-glow" />
                <h3 className="font-semibold text-sm">Agent Review</h3>
              </div>
              <ul className="space-y-2 text-sm text-foreground/75">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> Improved 3 emails for being too long.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> Updated tone to match {tone.toLowerCase()} preference.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> Removed 2 generic openers and replaced with event-specific hooks.</li>
              </ul>
            </div>
          </section>

          {/* RIGHT: Content */}
          <section className="space-y-5 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold">Marketing Content</h2>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-primary-glow" /> LinkedIn Posts
              </h3>
              <div className="space-y-3">
                {linkedinPosts.map((p, i) => (
                  <CopyableBlock key={i} text={p} label="LinkedIn post" />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                <Instagram className="h-4 w-4 text-primary-glow" /> Instagram Captions
              </h3>
              <div className="space-y-3">
                {instagramCaptions.map((p, i) => (
                  <CopyableBlock key={i} text={p} label="Instagram caption" />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground/80 mb-3 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-primary-glow" /> Sponsor Pitch Deck Bullets
              </h3>
              <div className="glow-card p-5">
                <ul className="space-y-3">
                  {sponsorPitchBullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground/85">
                      <span className="font-display font-bold gradient-text shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="max-w-2xl mx-auto mt-12 text-center animate-fade-in">
          <Button
            size="lg"
            onClick={() =>
              toast({
                title: "🚀 Campaign launched!",
                description: `Sending ${hostLeads.length + sponsorLeads.length} personalized messages now.`,
              })
            }
            className="w-full h-14 text-base font-semibold bg-gradient-success text-primary-foreground border-0 shadow-elevated hover:opacity-95"
          >
            ✅ Approve &amp; Launch Campaign 🚀
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
