import { create } from "zustand";

type Audience = "hosts" | "sponsors" | "universities";
type Tone = "Casual" | "Professional" | "Bold";

interface AgentState {
  company: string;
  city: string;
  audiences: Audience[];
  tone: Tone;
  setCompany: (v: string) => void;
  setCity: (v: string) => void;
  toggleAudience: (a: Audience) => void;
  setTone: (t: Tone) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  company: "Lynk — an AI networking app that turns event intros into long-term relationships.",
  city: "San Francisco",
  audiences: ["hosts", "sponsors"],
  tone: "Casual",
  setCompany: (v) => set({ company: v }),
  setCity: (v) => set({ city: v }),
  toggleAudience: (a) =>
    set((s) => ({
      audiences: s.audiences.includes(a)
        ? s.audiences.filter((x) => x !== a)
        : [...s.audiences, a],
    })),
  setTone: (t) => set({ tone: t }),
}));

export type { Audience, Tone };
