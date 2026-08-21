import { signToken } from '../utils/jwt';

export function authHeader(): string {
  const token = signToken({
    sub: '00000000-0000-0000-0000-000000000001',
    email: 'admin@oficina.com',
    role: 'admin',
  });
  return `Bearer ${token}`;
}
