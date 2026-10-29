export const BRAND_STORAGE_KEY = "qadam-brand-kit";

export type BrandKit = {
  brandName: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  audience: string;
  tone: string;
  slogan: string;
  language: "Russian" | "Kazakh" | "English";
  fontHeading: string;
  fontBody: string;
  colors: string[];
  logo: string;
  values: string;
  requiredPhrases: string;
  forbiddenPhrases: string;
  aiInstructions: string;
  updatedAt: string | null;
};

export const EMPTY_BRAND_KIT: BrandKit = {
  brandName:"", website:"", phone:"", email:"", address:"", description:"", audience:"", tone:"Professional",
  slogan:"", language:"Russian", fontHeading:"Inter", fontBody:"Inter", colors:["#071B33","#00AFCB","#F4C430","#FFFFFF"],
  logo:"", values:"", requiredPhrases:"", forbiddenPhrases:"", aiInstructions:"", updatedAt:null,
};

export function readBrandKit(): BrandKit {
  if (typeof window === "undefined") return EMPTY_BRAND_KIT;
  try { return { ...EMPTY_BRAND_KIT, ...JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY) || "{}") }; }
  catch { return EMPTY_BRAND_KIT; }
}
