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

export function formatTelefone(valor: string | number): string {
  const numeros = String(valor).replace(/\D/g, "");

  if (numeros.length !== 11) {
    return valor.toString();
  }

  const ddd = numeros.slice(0, 2);
  const parte1 = numeros.slice(2, 7);
  const parte2 = numeros.slice(7);

  return `(${ddd})${parte1}-${parte2}`;
}
