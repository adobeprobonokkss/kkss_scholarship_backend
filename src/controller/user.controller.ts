import { Request, Response } from "express";
import { getAllUsers } from "./../service/firebase.service";

export function authHandler(req: any, res: Response) {
  return res.json(req.user);
}

export async function getAllUsersHandler(req: any, res: Response) {
  if (!req.isUserAuthorized) return res.status(401).send("NOT_AUTHORIZED");
  const users = await getAllUsers("filter");
  return res.status(200).json(users);
}
