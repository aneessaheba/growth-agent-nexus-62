import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepProgressProps {
  current: 1 | 2 | 3 | 4;
}

const steps = [
  { id: 1, label: "Setup" },
  { id: 2, label: "Agent" },
  { id: 3, label: "Leads" },
  { id: 4, label: "Studio" },
];

export const StepProgress = ({ current }: StepProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-6 border-b border-border">
      {steps.map((step, idx) => {
        const isDone = step.id < current;
        const isActive = step.id === current;
        return (
          <div key={step.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-smooth border",
                  (isDone || isActive)
                    ? "bg-foreground border-foreground text-background"
                    : "bg-background border-border text-muted-foreground"
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:inline transition-smooth",
                  (isActive || isDone) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "h-px w-8 sm:w-12 transition-smooth",
                isDone ? "bg-foreground" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};
