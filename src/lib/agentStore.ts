import { create } from "zustand";

type Audience = "hosts" | "sponsors" | "universities";
type Tone = "Casual" | "Professional" | "Bold";

export interface Lead {
  name: string;
  event: string;
  attendees: number;
  linkedin_connections: number;
  instagram_followers: number;
  score: number;
  why_fit: string;
  email: string;
  linkedin_dm: string;
  instagram_dm: string;
}

export interface GrowthPackage {
  leads: Lead[];
  linkedin_posts: string[];
  instagram_captions: string[];
  sponsor_pitch_bullets: string[];
}

interface AgentState {
  company: string;
  city: string;
  audiences: Audience[];
  tone: Tone;
  pkg: GrowthPackage | null;
  loading: boolean;
  error: string | null;
  setCompany: (v: string) => void;
  setCity: (v: string) => void;
  toggleAudience: (a: Audience) => void;
  setTone: (t: Tone) => void;
  setPackage: (p: GrowthPackage | null) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  company: "Lynk — an AI networking app that turns event intros into long-term relationships.",
  city: "San Francisco",
  audiences: ["hosts", "sponsors"],
  tone: "Casual",
  pkg: null,
  loading: false,
  error: null,
  setCompany: (v) => set({ company: v }),
  setCity: (v) => set({ city: v }),
  toggleAudience: (a) =>
    set((s) => ({
      audiences: s.audiences.includes(a)
        ? s.audiences.filter((x) => x !== a)
        : [...s.audiences, a],
    })),
  setTone: (t) => set({ tone: t }),
  setPackage: (p) => set({ pkg: p }),
  setLoading: (b) => set({ loading: b }),
  setError: (e) => set({ error: e }),
}));

export type { Audience, Tone };
