import { apiFetch } from './api';
import { setToken, setUser } from './storage';

export type RegisterResponse = {
  token: string;
  user: {
    id: string;
    fullName: string;
    createdAt?: string;
  };
};

export async function register(fullName: string) {
  const res = await apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName }),
    auth: false,
  });

  setToken(res.token);
  setUser({ id: res.user.id, fullName: res.user.fullName });

  return res;
}

