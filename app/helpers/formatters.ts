export function formatCpfCnpj(value: string | number): string {
  // 1. Remove tudo que não é dígito
  const cleaned = value.toString().replace(/\D/g, "");

  // 2. Lógica para CPF (11 dígitos)
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  // 3. Lógica para CNPJ (14 dígitos)
  if (cleaned.length === 14) {
    return cleaned.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

  // Retorna o valor original se não for nem CPF nem CNPJ
  return value.toString();
}
