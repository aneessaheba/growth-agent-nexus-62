import { Sparkles } from "lucide-react";

export const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
      <Sparkles className="h-5 w-5 text-primary-foreground" />
    </div>
    <span className="font-display font-bold text-lg tracking-tight">
      Growth<span className="gradient-text">Agent</span>
    </span>
  </div>
);
