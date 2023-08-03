import { Request, Response } from "express";
export function authHandler(req: any, res: Response) {
  console.log(req.user);
  return res.json(req.user);
}
