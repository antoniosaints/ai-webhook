import { Request, Response } from "express";
import { ixcService } from "../service/ixc";

export const getContratoIXC = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({
        message: "O ID é obrigatório",
        data: null,
      });

    const user = await ixcService.getNomeClienteByContrato(Number(id));
    if (!user) {
      return res.status(500).json({
        message: "Não encontramos nenhum usuario",
        data: null,
      });
    }
    console.log(user);
    return res.json({
      message: "Usuário encontrado",
      data: user,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Erro ao buscar o cliente",
      data: err,
    });
  }
};
