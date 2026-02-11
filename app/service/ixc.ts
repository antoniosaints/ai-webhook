import { runQueryIXC } from "../database/mysql";

interface ClienteIXC {
  nome: string;
  cidade: string;
  data_ativacao: string;
  data_renovacao: string;
  data_validade: string;
  status: string;
  status_internet: string;
}

export const ixcService = {
  getNomeClienteByContrato: async (contrato: number) => {
    const sql = `
                SELECT c.razao as nome, ci.nome as cidade, ct.data_ativacao, ct.data_renovacao, ct.data_validade, ct.status, ct.status_internet
                FROM ixcprovedor.cliente_contrato as ct 
                LEFT JOIN ixcprovedor.cliente as c ON c.id = ct.id_cliente
                LEFT JOIN ixcprovedor.cidade as ci ON c.cidade = ci.id
                WHERE ct.id = ?;
                    `;
    const result = (await runQueryIXC(sql, [contrato])) as ClienteIXC[];
    if (result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  },
};
