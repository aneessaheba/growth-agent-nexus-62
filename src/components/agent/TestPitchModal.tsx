import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Lead, useAgentStore } from "@/lib/agentStore";
import { Loader2, Sparkles, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TestPitchModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TestPitchModal = ({ lead, open, onOpenChange }: TestPitchModalProps) => {
  const { updateLead, approveLead, approvedLeadIds } = useAgentStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset when lead/open changes
  useEffect(() => {
    if (open && lead) {
      setMessages([{ role: "user", content: lead.email }]);
      setCurrentEmail(lead.email);
      // Auto-trigger first simulated response
      void simulate(lead, [{ role: "user", content: lead.email }]);
    } else if (!open) {
      setMessages([]);
      setCurrentEmail("");
      setLoading(false);
      setRefining(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead?.id]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [messages, loading, refining]);

  const simulate = async (l: Lead, msgs: ChatMessage[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("simulate-pitch", {
        body: { mode: "simulate", lead: l, messages: msgs },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e) {
      toast({ title: "Simulation failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!lead) return;
    const lastResponse = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastResponse) {
      toast({ title: "No response yet", description: "Wait for the simulated reply first." });
      return;
    }
    setRefining(true);
    try {
      const refinePayload: ChatMessage[] = [
        {
          role: "user",
          content: `ORIGINAL EMAIL:\n${currentEmail}\n\nRECIPIENT'S RESPONSE:\n${lastResponse.content}\n\nRewrite the email to address their reaction.`,
        },
      ];
      const { data, error } = await supabase.functions.invoke("simulate-pitch", {
        body: { mode: "refine", lead, messages: refinePayload },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const refined = (data.reply || "").trim();
      setCurrentEmail(refined);
      updateLead(lead.id, { email: refined });
      // Send refined version into the chat as a new user message and re-simulate
      const next: ChatMessage[] = [...messages, { role: "user", content: refined }];
      setMessages(next);
      await simulate(lead, next);
      toast({ title: "Email refined", description: "New version sent to the recipient." });
    } catch (e) {
      toast({ title: "Refine failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setRefining(false);
    }
  };

  const handleApprove = () => {
    if (!lead) return;
    approveLead(lead.id);
    toast({ title: "Email approved", description: `Locked in for ${lead.name}.` });
    onOpenChange(false);
  };

  if (!lead) return null;
  const isApproved = approvedLeadIds.includes(lead.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-background border-foreground/20">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-extrabold tracking-tight">Simulate Customer Response</DialogTitle>
          <div className="flex items-start justify-between gap-4 pt-3">
            <div className="min-w-0">
              <div className="font-semibold text-base truncate">{lead.name}</div>
              <div className="text-sm text-muted-foreground truncate">{lead.company}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{lead.why_fit}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-extrabold tabular-nums leading-none">{lead.score}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">/100</div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] px-6 py-4" ref={scrollRef as any}>
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-foreground text-background self-end max-w-[85%]"
                    : "bg-secondary text-foreground self-start max-w-[85%] border border-border"
                }`}
              >
                <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2">
                  {m.role === "user" ? "GrowthAgent" : lead.name}
                </div>
                {m.content}
              </div>
            ))}
            {(loading || refining) && (
              <div className="bg-secondary border border-border rounded-xl p-4 self-start max-w-[85%] flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {refining ? "Refining email..." : `${lead.name} is typing...`}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-lg gap-2"
            onClick={handleRefine}
            disabled={loading || refining || messages.filter((m) => m.role === "assistant").length === 0}
          >
            <Sparkles className="h-4 w-4" />
            Refine Email
          </Button>
          <Button
            className="flex-1 rounded-lg gap-2 bg-foreground text-background hover:bg-foreground/90"
            onClick={handleApprove}
            disabled={loading || refining}
          >
            <Check className="h-4 w-4" />
            {isApproved ? "Approved" : "Looks Good — Approve"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
