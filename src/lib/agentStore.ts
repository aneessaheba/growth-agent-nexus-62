import { create } from "zustand";

export type LeadCategory = "customers" | "sponsors" | "b2b" | "partners";

export const CATEGORY_LABELS: Record<LeadCategory, string> = {
  customers: "Customers",
  sponsors: "Sponsors",
  b2b: "B2B",
  partners: "Partners",
};

export const CATEGORY_PROGRESS_LABELS: Record<LeadCategory, string> = {
  customers: "Finding Customers",
  sponsors: "Finding Sponsors",
  b2b: "Finding B2B",
  partners: "Finding Partners",
};

export interface Lead {
  id: string;
  category: LeadCategory;
  name: string;
  company: string;
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
  agent_review: string;
}

interface AgentState {
  companyDescription: string;
  pkg: GrowthPackage | null;
  loading: boolean;
  error: string | null;
  setCompanyDescription: (v: string) => void;
  setPackage: (p: GrowthPackage | null) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  companyDescription: "",
  pkg: null,
  loading: false,
  error: null,
  setCompanyDescription: (v) => set({ companyDescription: v }),
  setPackage: (p) => set({ pkg: p }),
  setLoading: (b) => set({ loading: b }),
  setError: (e) => set({ error: e }),
}));

export function leadsByCategory(pkg: GrowthPackage | null): Record<LeadCategory, Lead[]> {
  const empty: Record<LeadCategory, Lead[]> = { customers: [], sponsors: [], b2b: [], partners: [] };
  if (!pkg) return empty;
  for (const lead of pkg.leads) {
    if (empty[lead.category]) empty[lead.category].push(lead);
  }
  return empty;
}
