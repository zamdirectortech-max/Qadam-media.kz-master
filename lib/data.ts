import {
  BarChart3,
  Bot,
  CalendarDays,
  CreditCard,
  FolderKanban,
  Globe2,
  Image,
  LayoutDashboard,
  Library,
  Palette,
  PenLine,
  Settings,
  Share2,
  Shield,
  PlugZap,
  Users,
} from "lucide-react";
import type { Route } from "next";

type NavItem = {
  href: Route;
  label: string;
  icon: typeof LayoutDashboard;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/create", label: "Create Content", icon: PenLine },
  { href: "/dashboard/calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/dashboard/library", label: "Media Library", icon: Library },
  { href: "/dashboard/accounts", label: "Social Accounts", icon: Share2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot },
  { href: "/dashboard/brand", label: "Brand Kit", icon: Palette },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const platforms = [
  "Instagram",
  "Facebook",
  "TikTok",
  "Telegram",
  "YouTube",
  "LinkedIn",
  "WhatsApp",
  "Threads",
  "VK / ВКонтакте",
  "X / Twitter",
  "Google Business",
];

export const contentStyles = [
  "Professional",
  "Friendly",
  "Sales",
  "News",
  "Educational",
  "Luxury",
  "Casual",
  "Viral",
  "Official",
  "Minimal",
];

export const todayStats = [
  { label: "Scheduled posts", value: "18", icon: CalendarDays },
  { label: "Published", value: "42", icon: Globe2 },
  { label: "Drafts", value: "11", icon: FolderKanban },
  { label: "AI generations", value: "128", icon: Bot },
  { label: "Connected accounts", value: "5", icon: Shield },
];

export const variants = [
  {
    platform: "Instagram",
    title: "Caption + hashtags",
    text: "Открываем новый филиал в Шымкенте. Первые 3 дня - скидка 20%. Загляните первыми и отметьте нас в сторис.",
  },
  {
    platform: "TikTok",
    title: "Hook + short script",
    text: "Hook: Шымкент, это для вас. Script: 3 быстрых кадра филиала, команда встречает гостей, финальный кадр со скидкой 20%.",
  },
  {
    platform: "Telegram",
    title: "Concise post",
    text: "Новый филиал Qadam открыт в Шымкенте. С 28 по 30 сентября действует скидка 20%. Адрес и время работы внутри.",
  },
  {
    platform: "LinkedIn",
    title: "Business version",
    text: "Мы расширяем присутствие в Шымкенте, чтобы быть ближе к клиентам южного региона. В честь открытия действует welcome offer.",
  },
];

export const mediaAssets = [
  { type: "Photo", name: "branch-opening.jpg", tag: "Campaign", icon: Image },
  { type: "Video", name: "reels-intro.mp4", tag: "TikTok", icon: Image },
  { type: "AI", name: "30-day-plan.csv", tag: "Planning", icon: Bot },
  { type: "Document", name: "brand-brief.pdf", tag: "Brand", icon: Library },
];
