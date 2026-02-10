import { runQueryIXC } from "../database/mysql";

interface ClienteIXC {
  nome: string;
  data_ativacao: string;
  data_renovacao: string;
  data_validade: string;
  status: string;
  status_internet: string;
}

export const ixcService = {
  getNomeClienteByContrato: async (contrato: number) => {
    const sql = `
                SELECT c.razao as nome, ct.data_ativacao, ct.data_renovacao, ct.data_validade, ct.status, ct.status_internet
                FROM ixcprovedor.cliente_contrato as ct 
                LEFT JOIN ixcprovedor.cliente as c ON c.id = ct.id_cliente
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
