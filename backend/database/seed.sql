-- ============================================================
-- Seed inicial — usuário admin
-- Senha: admin123 (bcrypt rounds=12)
-- ============================================================
USE oficina;

INSERT INTO usuarios (id, nome, email, senha_hash, role, ativo)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Administrador',
  'admin@oficina.com',
  '$2a$12$b3nV7gWYLzwp161BfN6RR.Y4/vHyS/CNQfyeioys.iSHEOluQi0FC',
  'admin',
  1
)
ON DUPLICATE KEY UPDATE email = email;

-- Senha acima é o hash bcrypt de "admin123" com 12 rounds
-- Para regenerar: node -e "const b=require('bcryptjs');b.hash('admin123',12).then(console.log)"
