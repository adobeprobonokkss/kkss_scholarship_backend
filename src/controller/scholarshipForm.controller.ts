import { Request, Response } from "express";
import {
  checkIfScholarshipIDExists,
  getAllScholarshipFormData,
  getScholarshipFormData,
  saveScholarshipFormData,
  updateScholarshipFormData,
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

export async function getScholarshipFormDataHandler(req: any, res: Response) {
  const response = await getScholarshipFormData(req.body, req.user.decoded);
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

// review Application
export async function reviewApplicationHandler(req: Request, res: Response) {
  const response = await updateScholarshipFormData(
    req.body.email,
    req.body.scholarshipFormData
  );
  return res.status(200).json(response);
}
