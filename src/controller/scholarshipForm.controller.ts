import { Request, Response } from "express";
import {
  checkIfScholarshipIDExists,
  getAllScholarshipFormData,
  getScholarshipFormData,
  getScholarshipFormDataByEmailId,
  getScholarshipFormDataByName,
  getScholarshipFormDataByPhoneNumber,
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

export async function getScholarshipFormDataByEmailIdHandler(
  req: Request,
  res: Response
) {
  const response = await getScholarshipFormDataByEmailId(req.body.email);
  return res.status(200).json(response);
}

export async function getScholarshipFormDataByPhoneNumberHandler(
  req: Request,
  res: Response
) {
  const response = await getScholarshipFormDataByPhoneNumber(req.body.phNumber);
  return res.status(200).json(response);
}

export async function getScholarshipFormDataByNameHandler(
  req: Request,
  res: Response
) {
  const response = await getScholarshipFormDataByName(req.body.name);
  return res.status(200).json(response);
}

// get all Scholarship form data
export async function getAllScholarshipFormDataHandler(
  req: Request,
  res: Response
) {
  const response = await getAllScholarshipFormData();
  return res.status(200).json(response);
}
