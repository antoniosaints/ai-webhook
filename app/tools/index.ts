import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { runQueryCenso, runQueryIXC } from "../database/mysql";
import { getDb } from "../database/db";
import { formatCpfCnpj } from "../helpers/formatters";

// 1. Dicionário de funções executáveis (A lógica real)
const functionsImplementation: Record<string, Function> = {
  verificarClienteCenso: async ({ cpfCnpj }: { cpfCnpj: string }) => {
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
  clientesOnlineNoSistema: async () => {
    const sql = `
        SELECT
          CASE r.tipo_conexao_mapa
            WHEN '58' THEN 'Rádio'
            WHEN 'F'  THEN 'Fibra'
            ELSE 'Outro'
          END AS tipo_conexao,
          COUNT(*) AS total
        FROM ixcprovedor.radusuarios r
        WHERE r.online = 'S'
        GROUP BY r.tipo_conexao_mapa;
    `;
    const result = (await runQueryIXC(sql)) as any;
    if (result.length > 0) {
      const total = result;
      return { resultado: JSON.stringify(total) };
    } else {
      return {
        resultado: "Não encontrei nenhum cliente online no banco de dados.",
      };
    }
  },
  clientesOfflineNoSistema: async () => {
    const sql = `
        SELECT
          CASE r.tipo_conexao_mapa
            WHEN '58' THEN 'Rádio'
            WHEN 'F'  THEN 'Fibra'
            ELSE 'Outro'
          END AS tipo_conexao,
          COUNT(*) AS total
        FROM ixcprovedor.radusuarios r
        WHERE r.ativo = 'S' AND r.online = 'N'
        GROUP BY r.tipo_conexao_mapa;
    `;
    const result = (await runQueryIXC(sql)) as any;
    if (result.length > 0) {
      const total = result;
      return { resultado: JSON.stringify(total) };
    } else {
      return {
        resultado: "Não encontrei nenhum cliente offline no banco de dados.",
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
      return { resultado: `${total} cancelamentos` };
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
  debitosClientePorContrato: async ({ idContrato }: { idContrato: string }) => {
    const sql = `
        SELECT c.razao, fn.status, fn.data_emissao, fn.data_vencimento, fn.pagamento_data as data_pagamento, fn.obs, fn.tipo_recebimento, fn.valor_aberto, fn.valor, fn.valor_recebido, fn.valor_cancelado 
        FROM ixcprovedor.fn_areceber as fn 
        LEFT JOIN cliente as c ON c.id = fn.id_cliente
        WHERE fn.status NOT IN ('R','C') AND fn.id_contrato = ? OR fn.id_contrato_avulso = ?;
    `;
    const result = (await runQueryIXC(sql, [idContrato, idContrato])) as any;
    if (result.length > 0) {
      const debitos = result;
      return { resultado: JSON.stringify(debitos) };
    } else {
      return {
        resultado:
          "Não encontrei nenhum débito com este contrato no banco de dados.",
      };
    }
  },
  resetarBancoDeDados: async ({
    codigoConfirmacao,
  }: {
    codigoConfirmacao: string;
  }) => {
    console.log(codigoConfirmacao);
    if (codigoConfirmacao != "r5t6y7u8i9CAS") {
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
    name: "verificarClienteCenso",
    description:
      "Verifica informações do cliente no sistema pelo CPF ou CNPJ, retorne a lista de informações formatada",
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
    name: "clientesOnlineNoSistema",
    description:
      "Busca o número de clientes online no sistema, retorne a lista separada por tipo de conexão.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "clientesOfflineNoSistema",
    description:
      "Busca o número de clientes offline no sistema, retorne a lista separada por tipo de conexão.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "comodatoClientePorContrato",
    description:
      "Busca o comodato do contrato pelo ID, sempre retorne o comodato completo que vem da resposta e não crie dados ficticios.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        idContrato: {
          type: SchemaType.STRING,
          description: "O ID do contrato do cliente",
        },
      },
      required: ["idContrato"],
    },
  },
  {
    name: "debitosClientePorContrato",
    description:
      "Verifica debitos de um cliente pelo ID do contrato, sempre retorne a lista completa que vem como resposta, não resuma, formate com marcadores",
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
    description: `Busca a quantidade de cancelamentos no mês atual, não crie dados ficticios`,
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "proximosAniversariantes",
    description: `Verifica os próximos aniversariantes do mês com base na data${new Date().toLocaleDateString("pt-BR")},
    sempre retorne a lista completa que vem como resposta, não resuma, formate com marcadores`,
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "resetarBancoDeDados",
    description:
      "Use essa ferramenta para limpar o banco de dados, ela serve pra remover o historico das conversas.",
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
