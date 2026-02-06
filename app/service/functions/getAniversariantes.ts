import { runQueryCenso } from "../../database/mysql";
interface Aniversariantes {
  nome: string;
  nascimento: string;
}

export const getAniversariantes = async () => {
  const sql = `
            SELECT nome, DATE_FORMAT(datanasc, '%d/%m') as nascimento
            FROM usuarios
            WHERE func_mes = 'S'
            AND status = 'A'
            ORDER BY MONTH(datanasc) ASC, DAY(datanasc) ASC;
        `;
  const result = (await runQueryCenso(sql)) as Aniversariantes[];
  return result || [];
};
export const getAniversariantesDoDia = async () => {
  const sql = `
            SELECT nome, DATE_FORMAT(datanasc, '%d/%m') as nascimento
            FROM usuarios
            WHERE func_mes = 'S'
            AND status = 'A'
            AND DATE_FORMAT(datanasc, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d');
        `;
  const result = (await runQueryCenso(sql)) as Aniversariantes[];
  return result || [];
};
