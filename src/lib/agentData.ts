export type Score = number;

export interface HostLead {
  id: string;
  name: string;
  event: string;
  score: Score;
  attendees: number;
  frequency: "Weekly" | "Monthly" | "One-off" | "Bi-weekly";
  location: string;
  reason: string;
  avatar: string;
}

export interface SponsorLead {
  id: string;
  company: string;
  industry: string;
  score: Score;
  reason: string;
  budget: "Low" | "Medium" | "High";
  avatar: string;
}

export const hostLeads: HostLead[] = [
  {
    id: "h1",
    name: "Maya Chen",
    event: "SF AI Founders Mixer",
    score: 94,
    attendees: 220,
    frequency: "Monthly",
    location: "San Francisco, CA",
    reason: "Her crowd is exactly Lynk's ICP — early-stage AI founders who network compulsively.",
    avatar: "MC",
  },
  {
    id: "h2",
    name: "Devon Park",
    event: "Cerebral Valley Demo Night",
    score: 88,
    attendees: 350,
    frequency: "Bi-weekly",
    location: "San Francisco, CA",
    reason: "High-signal attendees with deep follow-up needs — Lynk's matchmaking shines here.",
    avatar: "DP",
  },
  {
    id: "h3",
    name: "Priya Natarajan",
    event: "Women in AI Brunch",
    score: 82,
    attendees: 120,
    frequency: "Monthly",
    location: "San Francisco, CA",
    reason: "Tight-knit community looking for tools that surface meaningful intros post-event.",
    avatar: "PN",
  },
  {
    id: "h4",
    name: "Jordan Reed",
    event: "Hacker House Sundays",
    score: 71,
    attendees: 80,
    frequency: "Weekly",
    location: "Mission District, SF",
    reason: "Recurring crowd that benefits from Lynk's persistent connection memory.",
    avatar: "JR",
  },
  {
    id: "h5",
    name: "Alex Kowalski",
    event: "GTM Engineers Meetup",
    score: 67,
    attendees: 140,
    frequency: "Monthly",
    location: "SoMa, SF",
    reason: "Operators who'd love Lynk's CRM-like layer over casual conversations.",
    avatar: "AK",
  },
  {
    id: "h6",
    name: "Sam Whitaker",
    event: "Indie Maker Coffee",
    score: 54,
    attendees: 45,
    frequency: "One-off",
    location: "Hayes Valley, SF",
    reason: "Small but passionate — good for early Lynk evangelism, lower scale.",
    avatar: "SW",
  },
];

export const sponsorLeads: SponsorLead[] = [
  {
    id: "s1",
    company: "Notion",
    industry: "Productivity SaaS",
    score: 91,
    reason: "Targets the same founder/operator audience and runs steady community sponsorships.",
    budget: "High",
    avatar: "N",
  },
  {
    id: "s2",
    company: "Linear",
    industry: "Dev Tools",
    score: 86,
    reason: "Active in SF dev events, brand fits Lynk's premium product feel.",
    budget: "High",
    avatar: "L",
  },
  {
    id: "s3",
    company: "Vercel",
    industry: "Cloud / DevOps",
    score: 83,
    reason: "Pushing AI-native developer outreach — overlaps with Lynk's user base.",
    budget: "High",
    avatar: "V",
  },
  {
    id: "s4",
    company: "Ramp",
    industry: "Fintech",
    score: 76,
    reason: "Founder-heavy ICP and a known sponsor of SF founder dinners.",
    budget: "Medium",
    avatar: "R",
  },
  {
    id: "s5",
    company: "Pylon",
    industry: "B2B SaaS",
    score: 64,
    reason: "Smaller budget but strong product fit with Lynk's relationship layer.",
    budget: "Medium",
    avatar: "P",
  },
  {
    id: "s6",
    company: "Brew Coffee Co.",
    industry: "Local F&B",
    score: 48,
    reason: "Local brand awareness play — modest spend, light strategic value.",
    budget: "Low",
    avatar: "B",
  },
];

export const linkedinPosts = [
  "Most networking apps die after the event. Lynk doesn't. We turn every handshake into a relationship your future self will thank you for. 🧠✨",
  "Hot take: your CRM is a graveyard of intros you forgot to follow up on. Lynk is the AI layer that actually remembers — and nudges you at the right moment.",
  "Founders we work with say it best: 'Lynk made my network feel 10x bigger overnight.' That's because we surface the people you already know, but forgot you knew. 💜",
];

export const instagramCaptions = [
  "Your network is your net worth — but only if you remember it. Meet Lynk. 💜🤝\n\n#networking #founders #ai #startuplife #sf",
  "Walked into a room of 200 strangers. Walked out with 12 real connections. That's the Lynk difference. ✨\n\n#aiapp #networkingtips #buildinpublic #techsf",
  "Stop collecting business cards. Start building your relationship graph. 🧠📈\n\n#productlaunch #ainetworking #lynk #startup #community",
];

export const sponsorPitchBullets = [
  "Lynk events attract a hyper-targeted audience of 200+ AI founders, operators, and investors per night.",
  "Sponsors get on-stage thanks, branded swag placement, and a dedicated post-event email to all attendees.",
  "Average attendee LTV in our network exceeds $4,800 — these are decision-makers, not lurkers.",
  "We co-brand the Lynk in-app event hub, giving sponsors persistent visibility long after the night ends.",
  "Performance-tracked: every sponsor receives a post-event report with engagement, opt-ins, and warm intros.",
];

export const buildOutreach = (leadName: string, tone: string) => ({
  email: `Hey ${leadName.split(" ")[0]},\n\nI've been following the events you put together in SF — the energy your community brings is exactly the kind of room Lynk was built for. We're the AI networking layer that turns one-night intros into long-term relationships, and your hosts and attendees would get a ton of value from it.\n\nWould you be open to a 15-min chat next week? Happy to sponsor your next event as a thank-you.\n\n— The Lynk team`,
  linkedin: `Hi ${leadName.split(" ")[0]} — huge fan of what you're building in the SF community. We're working on Lynk (AI networking app) and your audience feels like a perfect match. Mind if I send over a quick note on how we could partner on your next event?`,
  instagram: `hey ${leadName.split(" ")[0]} 👋 love your events! we run Lynk — AI networking app that keeps your attendees connected long after the night ends. would love to chat about a collab 💜`,
});
