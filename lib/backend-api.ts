export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  locale: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  organization_id: string;
  workspace_id: string;
  plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
};

export async function authRequest(path: string, body?: unknown) {
  const response = await fetch(`${API_URL}/api/v1/auth/${path}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || "Не удалось выполнить запрос");
  return data;
}
