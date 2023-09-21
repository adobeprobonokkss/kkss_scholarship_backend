import { Request, Response } from "express";
import {
  approveVolunteeringHours,
  checkIfScholarshipIDExists,
  getAllScholarshipFormData,
  getScholarshipFormData,
  getVolunteeringHours,
  saveScholarshipFormData,
  submitVolunteeringHours,
  updateScholarshipFormData,
  getCountOfScholarShipData,
} from "../service/firebase.service";
import { RoleType } from "./../utils/types";

export async function checkIfScholarshipIDExistsHandler(
  req: Request,
  res: Response
) {
  const response = await checkIfScholarshipIDExists(req.body.scholarshipID);
  return res.status(200).json(response);
}

export async function submitApplicationHandler(req: Request, res: Response) {
  const response = await saveScholarshipFormData(req.body.scholarshipFormData);
  return res.status(200).json(response);
}

export async function getScholarshipFormDataHandler(
  req: Request & { user: any },
  res: Response
) {
  const response = await getScholarshipFormData(req.body, req.user.decoded);
  return res.status(200).json(response);
  // }
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

// submit Volunteering hours
export async function submitVolunteeringHoursHandler(
  req: Request & { user: any },
  res: Response
) {
  const response = await submitVolunteeringHours(
    req.body.volunteeringDetails,
    req.user.decoded
  );
  return res.status(200).json(response);
}

// get Volunteering hours
export async function getVolunteeringHoursHandler(
  req: Request & { user: any },
  res: Response
) {
  const response = await getVolunteeringHours(req.user.decoded);
  return res.status(200).json(response);
}

// approve Volunteering hours
export async function approveVolunteeringHoursHandler(
  req: Request & { user: any },
  res: Response
) {
  const response = await approveVolunteeringHours(
    req.body.requestID,
    req.body.,
    req.user.decoded
  );
  return res.status(200).json(response);
}

export async function getTotalCountHandler(req: any, res: Response) {
  // return res.status(200).json({});
  console.log(req.body.year);
  const year = req.body.year;
  const status = req.body.status;
  console.log(year, status);
  const response = await getCountOfScholarShipData(year, status);
  return res.status(200).json(response);
}
