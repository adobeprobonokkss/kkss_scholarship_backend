import { Request, Response } from "express";
import { getAllUsers, updateUserData } from "./../service/firebase.service";

export function authHandler(req: any, res: Response) {
  return res.json(req.user);
}

export async function getAllUsersHandler(req: any, res: Response) {
  const { keyName, partialText } = req.body;
  console.log(keyName, partialText);
  const users = await getAllUsers(keyName, partialText);
  return res.status(200).json(users);
}

export async function promoteUserRole(req: any, res: Response) {
  const { email, role } = req.body;
  const userEmailToBePromoted = email;
  const promotedRole = role;
  await updateUserData(userEmailToBePromoted, promotedRole);
  return res.sendStatus(200);
}
