import { runQueryCenso } from "../database/mysql";
import { formatTelefone } from "../helpers/formatters";

export const censoService = {
  getUserByNumber: async (number: string) => {
    const telefoneFormatado = formatTelefone(number);
    const sql = `
                SELECT nome, status, func_mes
                FROM usuarios
                WHERE func_mes = 'S'
                AND status = 'A'
                AND cel = ?
            `;
    const result = (await runQueryCenso(sql, [telefoneFormatado])) as any;
    if (result.length > 0) {
      return result;
    } else {
      return null;
    }
  },
};
