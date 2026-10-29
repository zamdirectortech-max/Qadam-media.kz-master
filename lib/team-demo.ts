import type { PlanCode } from "@/lib/billing-plans";

export type TeamRole = "Owner" | "Admin" | "Manager" | "Editor" | "Viewer";
export type MemberStatus = "active" | "inactive";
export type ActivityCategory = "publications" | "team" | "projects" | "social" | "settings";

export const PROJECTS = [
  { id: "qadam", name: "Қадам Media", status: "active" },
  { id: "client-a", name: "Client A", status: "active" },
  { id: "client-b", name: "Client B", status: "active" },
  { id: "client-c", name: "Client C", status: "active" },
] as const;

export type PermissionKey = "create" | "edit" | "schedule" | "ai" | "delete" | "socials" | "team" | "billing" | "analytics";

export const ROLE_PERMISSIONS: Record<TeamRole, PermissionKey[]> = {
  Owner: ["create", "edit", "schedule", "ai", "delete", "socials", "team", "billing", "analytics"],
  Admin: ["create", "edit", "schedule", "ai", "delete", "socials", "team", "analytics"],
  Manager: ["create", "edit", "schedule", "ai", "delete", "team", "analytics"],
  Editor: ["create", "edit", "schedule", "ai"],
  Viewer: ["analytics"],
};

export const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  Owner: "Полный контроль workspace, команды и оплаты.",
  Admin: "Управление командой и контентом без доступа к Billing и Owner.",
  Manager: "Проекты, публикации, планирование и аналитика.",
  Editor: "Создание, редактирование и планирование контента.",
  Viewer: "Только просмотр проектов, календаря и аналитики.",
};

export type TeamMember = {
  id: string; name: string; email: string; avatar: string; role: TeamRole;
  status: MemberStatus; lastActive: string; projectIds: string[]; permissions: PermissionKey[];
};
export type TeamInvitation = {
  id: string; email: string; role: Exclude<TeamRole, "Owner">; projectIds: string[];
  status: "pending"; createdAt: string; expiresAt: string;
};
export type TeamActivity = {
  id: string; userId: string; userName: string; action: string; object: string;
  projectId?: string; category: ActivityCategory; createdAt: string;
};
export type TeamDemoState = { team: { id: string; name: string; plan: PlanCode; ownerId: string }; members: TeamMember[]; invitations: TeamInvitation[]; activities: TeamActivity[] };

export const INITIAL_TEAM_STATE: TeamDemoState = {
  team: { id: "team-qadam", name: "Қадам Media", plan: "PRO", ownerId: "u1" },
  members: [
    { id:"u1", name:"Rauan", email:"rauan@qadam.media", avatar:"R", role:"Owner", status:"active", lastActive:"Сегодня, 14:32", projectIds:PROJECTS.map(p=>p.id), permissions:ROLE_PERMISSIONS.Owner },
    { id:"u2", name:"Ayan S.", email:"ayan@example.com", avatar:"AS", role:"Admin", status:"active", lastActive:"Сегодня, 14:10", projectIds:PROJECTS.map(p=>p.id), permissions:ROLE_PERMISSIONS.Admin },
    { id:"u3", name:"Dias K.", email:"dias@example.com", avatar:"DK", role:"Manager", status:"inactive", lastActive:"Сегодня, 13:18", projectIds:["client-a","client-b"], permissions:ROLE_PERMISSIONS.Manager },
    { id:"u4", name:"Madina A.", email:"madina@example.com", avatar:"MA", role:"Editor", status:"inactive", lastActive:"3 дня назад", projectIds:["client-a"], permissions:ROLE_PERMISSIONS.Editor },
    { id:"u5", name:"Amina T.", email:"amina@gmail.com", avatar:"AT", role:"Viewer", status:"inactive", lastActive:"5 дней назад", projectIds:["qadam"], permissions:ROLE_PERMISSIONS.Viewer },
  ],
  invitations: [
    { id:"i1", email:"user@gmail.com", role:"Editor", projectIds:["client-a"], status:"pending", createdAt:"Сегодня, 12:05", expiresAt:"Через 7 дней" },
  ],
  activities: [
    { id:"a1", userId:"u2", userName:"Ayan", action:"Изменил публикацию", object:"Instagram", projectId:"client-a", category:"publications", createdAt:"14:32" },
    { id:"a2", userId:"u3", userName:"Dias", action:"Создал публикацию", object:"TikTok", projectId:"client-b", category:"publications", createdAt:"13:18" },
    { id:"a3", userId:"u1", userName:"Rauan", action:"Пригласил участника", object:"user@gmail.com", category:"team", createdAt:"12:05" },
    { id:"a4", userId:"u4", userName:"Madina", action:"Изменила роль пользователя", object:"Viewer → Editor", category:"team", createdAt:"Вчера" },
    { id:"a5", userId:"u1", userName:"Rauan", action:"Создал проект", object:"Client C", projectId:"client-c", category:"projects", createdAt:"2 дня назад" },
  ],
};
