import { getPublicEnv } from './env';
import { getToken } from './storage';

export type ApiError = {
  status: number;
  message: string;
};

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { apiUrl } = getPublicEnv();
  const url = `${apiUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (init.auth !== false) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const body = await parseJsonSafe(res);
  if (!res.ok) {
    const msg =
      (body && typeof body === 'object' && 'message' in body && typeof (body as any).message === 'string'
        ? (body as any).message
        : `Request failed (${res.status})`) || `Request failed (${res.status})`;
    const err: ApiError = { status: res.status, message: msg };
    throw err;
  }

  return body as T;
}

