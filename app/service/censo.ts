import { runQueryCenso } from "../database/mysql";
import { formatTelefone } from "../helpers/formatters";

interface UserCenso {
  nome: string;
  status: string;
  cidade: string;
  datanasc: string;
  email: string;
  cel: string;
  adm: string;
  id_grupo: number;
  grupo: string;
  cor: string;
}

export const censoService = {
  getUserByNumber: async (number: string): Promise<UserCenso | null> => {
    const telefoneFormatado = formatTelefone(number);
    const sql = `
                SELECT u.nome, u.status, u.cidade, u.datanasc, u.email, u.cel, u.adm, p.id as id_grupo, p.grupo, p.cor 
                FROM usuarios as u
                LEFT JOIN cs_gp_usuarios as p ON p.id = u.grupo_id
                WHERE u.status = 'A' AND u.cel = ?;
            `;
    const result = (await runQueryCenso(sql, [
      telefoneFormatado,
    ])) as UserCenso[];
    if (result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  },
};
