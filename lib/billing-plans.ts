export type PlanCode = "FREE" | "START" | "PRO" | "BUSINESS";
export type BillingCycle = "monthly" | "yearly";
export type UsageKey = "publications" | "ai" | "videos" | "storage" | "socials" | "users" | "projects";

export type Plan = {
  code: PlanCode;
  priceMonthly: number;
  priceYearly: number;
  socialLimit: number;
  publicationLimit: number;
  aiLimit: number;
  videoLimit: number;
  storageLimit: number;
  userLimit: number;
  projectLimit: number;
  analytics: "basic" | "advanced";
  features: {
    scheduler: boolean;
    autoPublish: boolean;
    aiContent: boolean;
    aiVideo: boolean;
    teamwork: boolean;
    prioritySupport: boolean;
  };
};

export const PLAN_ORDER: PlanCode[] = ["FREE", "START", "PRO", "BUSINESS"];

export const PLANS: Record<PlanCode, Plan> = {
  FREE: { code:"FREE", priceMonthly:0, priceYearly:0, socialLimit:2, publicationLimit:30, aiLimit:10, videoLimit:3, storageLimit:1, userLimit:1, projectLimit:1, analytics:"basic", features:{scheduler:true,autoPublish:true,aiContent:false,aiVideo:false,teamwork:false,prioritySupport:false} },
  START: { code:"START", priceMonthly:3190, priceYearly:31900, socialLimit:4, publicationLimit:150, aiLimit:50, videoLimit:10, storageLimit:5, userLimit:1, projectLimit:2, analytics:"basic", features:{scheduler:true,autoPublish:true,aiContent:true,aiVideo:false,teamwork:false,prioritySupport:false} },
  PRO: { code:"PRO", priceMonthly:5999, priceYearly:59990, socialLimit:8, publicationLimit:500, aiLimit:100, videoLimit:30, storageLimit:20, userLimit:3, projectLimit:5, analytics:"advanced", features:{scheduler:true,autoPublish:true,aiContent:true,aiVideo:true,teamwork:true,prioritySupport:true} },
  BUSINESS: { code:"BUSINESS", priceMonthly:14999, priceYearly:149990, socialLimit:20, publicationLimit:2000, aiLimit:500, videoLimit:100, storageLimit:100, userLimit:10, projectLimit:20, analytics:"advanced", features:{scheduler:true,autoPublish:true,aiContent:true,aiVideo:true,teamwork:true,prioritySupport:true} },
};

// Until usage is read from the backend, a newly registered account starts clean.
export const DEMO_USAGE: Record<UsageKey, number> = { publications:0, ai:0, videos:0, storage:0, socials:0, users:0, projects:0 };

export const ADD_ONS = [
  { id:"publications", usageKey:"publications" as const, amount:100, price:990 },
  { id:"ai", usageKey:"ai" as const, amount:100, price:1990 },
  { id:"videos", usageKey:"videos" as const, amount:10, price:2990 },
  { id:"storage", usageKey:"storage" as const, amount:10, price:990 },
] as const;

export function planLimit(plan: Plan, key: UsageKey): number {
  return ({ publications:plan.publicationLimit, ai:plan.aiLimit, videos:plan.videoLimit, storage:plan.storageLimit, socials:plan.socialLimit, users:plan.userLimit, projects:plan.projectLimit })[key];
}

export function formatKzt(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₸`;
}
