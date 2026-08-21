import { signToken } from '../utils/jwt';

export const USUARIO_TESTE_PADRAO = '00000000-0000-0000-0000-000000000001';

export function authHeader(overrides: { sub?: string; email?: string; role?: string } = {}): string {
  const token = signToken({
    sub: overrides.sub ?? USUARIO_TESTE_PADRAO,
    email: overrides.email ?? 'admin@oficina.com',
    role: overrides.role ?? 'admin',
  });
  return `Bearer ${token}`;
}
