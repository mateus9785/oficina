export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\d{10,11}$/.test(phone.replace(/\D/g, ''));
}

export function isValidPlaca(placa: string): boolean {
  // Placa antiga (ABC-1234) ou Mercosul (ABC1D23)
  return /^[A-Z]{3}-?\d{4}$/.test(placa.toUpperCase()) ||
         /^[A-Z]{3}\d[A-Z]\d{2}$/.test(placa.toUpperCase());
}

export function isValidCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11;
}

export function isValidCnpj(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.length === 14;
}
