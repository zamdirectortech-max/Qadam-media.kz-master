export type IntegrationStatus =
  | "CONNECTED" | "AUTHENTICATION_ERROR" | "PERMISSION_ERROR" | "API_ERROR"
  | "RATE_LIMIT" | "CONFIGURATION_ERROR" | "NOT_CONNECTED" | "EXPIRED_TOKEN"
  | "PLATFORM_REJECTED" | "UNKNOWN_ERROR";

export type Integration = {
  code: string; name: string; status: IntegrationStatus; apiVersion: string;
  documentationUrl: string; redirectUri: string; oauth: boolean;
};

export const integrations: Integration[] = [
  { code: "tiktok", name: "TikTok", status: "NOT_CONNECTED", apiVersion: "v2", oauth: true, redirectUri: "https://qadam-media.kz/api/integrations/tiktok/callback", documentationUrl: "https://developers.tiktok.com/doc/" },
  { code: "instagram", name: "Instagram", status: "NOT_CONNECTED", apiVersion: "v23.0", oauth: true, redirectUri: "https://qadam-media.kz/api/integrations/instagram/callback", documentationUrl: "https://developers.facebook.com/docs/instagram-platform/" },
  { code: "facebook", name: "Facebook", status: "NOT_CONNECTED", apiVersion: "v23.0", oauth: true, redirectUri: "https://qadam-media.kz/api/integrations/facebook/callback", documentationUrl: "https://developers.facebook.com/docs/" },
  { code: "telegram", name: "Telegram", status: "NOT_CONNECTED", apiVersion: "Bot API", oauth: false, redirectUri: "https://qadam-media.kz/api/integrations/telegram/webhook", documentationUrl: "https://core.telegram.org/bots/api" },
  { code: "youtube", name: "YouTube", status: "NOT_CONNECTED", apiVersion: "v3", oauth: true, redirectUri: "https://qadam-media.kz/api/integrations/youtube/callback", documentationUrl: "https://developers.google.com/youtube/v3" },
  { code: "linkedin", name: "LinkedIn", status: "NOT_CONNECTED", apiVersion: "202509", oauth: true, redirectUri: "https://qadam-media.kz/api/integrations/linkedin/callback", documentationUrl: "https://learn.microsoft.com/linkedin/" },
  { code: "whatsapp", name: "WhatsApp", status: "NOT_CONNECTED", apiVersion: "Cloud API", oauth: true, redirectUri: "https://qadam-media.kz/api/integrations/whatsapp/callback", documentationUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/" },
  { code: "threads", name: "Threads", status: "NOT_CONNECTED", apiVersion: "v1.0", oauth: true, redirectUri: "https://qadam-media.kz/api/integrations/threads/callback", documentationUrl: "https://developers.facebook.com/docs/threads/" },
  { code: "vk", name: "VK / ВКонтакте", status: "NOT_CONNECTED", apiVersion: "v5.199", oauth: true, redirectUri: "https://qadam-media.kz/api/integrations/vk/callback", documentationUrl: "https://dev.vk.com/" },
  { code: "x", name: "X / Twitter", status: "NOT_CONNECTED", apiVersion: "v2", oauth: true, redirectUri: "https://qadam-media.kz/api/integrations/x/callback", documentationUrl: "https://developer.x.com/en/docs/x-api" },
  { code: "google_business", name: "Google Business Profile", status: "NOT_CONNECTED", apiVersion: "v1", oauth: true, redirectUri: "https://qadam-media.kz/api/integrations/google-business/callback", documentationUrl: "https://developers.google.com/my-business" },
];

export const apiLogs = [
  { id: "QDM-20260928-8F42A1", timestamp: "2026-09-28 12:42:10", platform: "TikTok", account: "Not connected", endpoint: "/v2/user/info/", method: "GET", httpStatus: 0, errorCode: "CONFIG_MISSING", message: "Credentials have not been configured", duration: 0, status: "CONFIGURATION_ERROR" },
];
