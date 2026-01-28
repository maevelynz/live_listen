import { io, type Socket } from 'socket.io-client';
import { getPublicEnv } from './env';
import { getToken } from './storage';

export function createSocket(): Socket {
  const { wsUrl } = getPublicEnv();
  const token = getToken();

  return io(wsUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    auth: token ? { token } : {},
  });
}

