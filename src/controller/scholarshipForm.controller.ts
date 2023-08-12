import { Request, Response } from "express";
import {
  checkIfScholarshipIDExists,
  getScholarshipFormData,
  saveScholarshipFormData,
} from "../service/firebase.service";

export async function checkIfScholarshipIDExistsHandler(
  req: any,
  res: Response
) {
  const response = await checkIfScholarshipIDExists(req.body.scholarshipID);
  return res.status(200).json(response);
}

export async function submitApplicationHandler(req: any, res: Response) {
  const response = await saveScholarshipFormData(req.body.scholarshipFormData);
  return res.status(200).json(response);
}

export async function getScholarshipFormDataHandler(
  req: Request,
  res: Response
) {
  const response = await getScholarshipFormData(req.body.scholarshipID);
  return res.status(200).json(response);
}
