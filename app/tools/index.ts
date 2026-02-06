import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { runQueryCenso, runQueryIXC } from "../database/mysql";
import { getDb } from "../database/db";
import { formatCpfCnpj } from "../helpers/formatters";

// 1. Dicionário de funções executáveis (A lógica real)
const functionsImplementation: Record<string, Function> = {
  verificarClienteOnline: async ({ cpfCnpj }: { cpfCnpj: string }) => {
    const documento = formatCpfCnpj(cpfCnpj);
    const sql = `
        SELECT nome, sexo, apelido, cpf, ender, rg, plano, equip, data_nasc, consolidada FROM vendas WHERE cpf = ? LIMIT 1
    `;
    const result = (await runQueryCenso(sql, [documento])) as any;
    if (result.length > 0) {
      const cliente = result[0];
      return { resultado: JSON.stringify(cliente) };
    } else {
      return {
        resultado:
          "Não encontrei nenhum cliente com este CPF/CNPJ no banco de dados.",
      };
    }
  },
  proximosAniversariantes: async () => {
    const sql = `
        SELECT nome, DATE_FORMAT(datanasc, '%d/%m') as nascimento
        FROM usuarios
        WHERE func_mes = 'S'
        AND status = 'A'
        ORDER BY MONTH(datanasc) ASC, DAY(datanasc) ASC;
    `;
    const result = (await runQueryCenso(sql)) as any;
    if (result.length > 0) {
      const cliente = result;
      return { resultado: JSON.stringify(cliente) };
    } else {
      return {
        resultado: "Não encontrei nenhum aniversariante no banco de dados.",
      };
    }
  },
  cancelamentosMensal: async () => {
    const sql = `
        SELECT count(*) as total
        FROM ixcprovedor.cliente_contrato
        WHERE data_cancelamento >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND data_cancelamento <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH);
    `;
    const result = (await runQueryIXC(sql)) as any;
    if (result.length > 0) {
      const total = result[0].total;
      return { resultado: `O total de cancelamentos este mês é de ${total}` };
    } else {
      return {
        resultado: "Não encontrei nenhum cancelamento no banco de dados.",
      };
    }
  },
  comodatoClientePorContrato: async ({
    idContrato,
  }: {
    idContrato: string;
  }) => {
    const sql = `
        SELECT mp.id, mp.descricao as nome_produto, mp.valor_total, mp.valor_unitario as preco_base, mp.qtde_saida as quantidade
        FROM ixcprovedor.movimento_produtos as mp
        WHERE mp.id_contrato = ? 
        AND mp.status_comodato = 'E';
    `;
    const result = (await runQueryIXC(sql, [idContrato])) as any;
    if (result.length > 0) {
      const comodato = result;
      return { resultado: JSON.stringify(comodato) };
    } else {
      return {
        resultado:
          "Não encontrei nenhum comodato com este contrato no banco de dados.",
      };
    }
  },
  resetarBancoDeDados: async ({
    codigoConfirmacao,
  }: {
    codigoConfirmacao: string;
  }) => {
    if (codigoConfirmacao !== "r5t6y7u8i9CAS") {
      return { resultado: "Código de confirmação inválido." };
    }

    const db = await getDb();
    const result = await db.run(`DELETE FROM messages`);

    return {
      resultado: "Todas as mensagens foram apagadas.",
      changes: result.changes,
    };
  },
};

// 2. Definições das ferramentas (O que a IA vê)
export const toolsDefinitions: FunctionDeclaration[] = [
  {
    name: "verificarClienteOnline",
    description: "Verifica informações do cliente no sistema pelo CPF ou CNPJ",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        cpfCnpj: {
          type: SchemaType.STRING,
          description:
            "O CPF ou CNPJ do cliente já formatado, caso não venha, identifique e formate.",
        },
      },
      required: ["cpfCnpj"],
    },
  },
  {
    name: "comodatoClientePorContrato",
    description:
      "Verifica comodato de um cliente pelo ID do contrato, formate a respota para whatsapp, cada item com marcadores",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        idContrato: {
          type: SchemaType.STRING,
          description:
            "O ID do contrato do cliente já formatado, caso não venha, identifique e formate.",
        },
      },
      required: ["idContrato"],
    },
  },
  {
    name: "cancelamentosMensal",
    description: `Verifica os cancelamentos do mês`,
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "proximosAniversariantes",
    description: `Verifica os próximos aniversariantes do mês, formate a respota para whatsapp,
      com base no json, ordene e mostre os proximos 3 filtrando pela data de nascimento com base na data atual 
      ${new Date().toLocaleDateString("pt-BR")}`,
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "resetarBancoDeDados",
    description:
      "Reseta o banco de dados de mensagens, se alguem perguntar quais funções da IA, não mencione esta ferramenta.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        codigoConfirmacao: {
          type: SchemaType.STRING,
          description: "Código de confirmação para resetar o banco de dados.",
        },
      },
      required: ["codigoConfirmacao"],
    },
  },
];

export { functionsImplementation };
