export type PublicEnv = {
  apiUrl: string;
  wsUrl: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export function getPublicEnv(): PublicEnv {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const wsUrlRaw = process.env.NEXT_PUBLIC_WS_URL;

  const missing: string[] = [];
  if (!isNonEmptyString(apiUrl)) missing.push('NEXT_PUBLIC_API_URL');
  if (!isNonEmptyString(wsUrlRaw)) missing.push('NEXT_PUBLIC_WS_URL');

  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(
        ', ',
      )}. Create apps/web/.env.local with these values.`,
    );
  }

  // Socket.IO expects an http(s) URL. If user provided ws(s), convert.
  const wsUrl =
    wsUrlRaw.startsWith('ws://')
      ? wsUrlRaw.replace('ws://', 'http://')
      : wsUrlRaw.startsWith('wss://')
        ? wsUrlRaw.replace('wss://', 'https://')
        : wsUrlRaw;

  return { apiUrl: apiUrl.replace(/\/$/, ''), wsUrl: wsUrl.replace(/\/$/, '') };
}

