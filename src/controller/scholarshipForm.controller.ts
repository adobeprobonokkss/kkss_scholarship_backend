import { Request, Response } from "express";
import {
  approveOrRejectVolunteeringHours,
  checkIfScholarshipIDExists,
  getAllScholarshipFormData,
  getScholarshipFormData,
  getVolunteeringHours,
  saveScholarshipFormData,
  submitVolunteeringHours,
  updateScholarshipFormData,
  getCountOfScholarShipData,
  getAllVolunteeringActivityHoursByUser,
  getVolunteerActivityHours,
  getAllVolunteerActivityHours,
  getVolunteerHoursByScholarshipIDList,
  UserSchema,
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
  req: Request & { user?: any },
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
  const response = await getAllScholarshipFormData(req.body.limit);
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
  req: Request & { user?: any },
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
  req: Request & { user?: any },
  res: Response
) {
  const response = await getVolunteeringHours(
    req.body.scholarshipID,
    req.body.email,
    req.user.decoded
  );
  return res.status(200).json(response);
}

// get all Volunteering Activity by user
export async function getAllVolunteeringActivityHoursByUserHandler(
  req: Request & { user?: any },
  res: Response
) {
  const response = await getAllVolunteeringActivityHoursByUser(
    req.body.scholarshipID,
    req.body.email,
    req.user.decoded
  );
  return res.status(200).json(response);
}

// get Volunteer Activity Hours by requestID
export async function getVolunteerActivityHoursByRequestIDHandler(
  req: Request & { user?: any },
  res: Response
) {
  const response = await getVolunteerActivityHours(req.body.requestID);
  return res.status(200).json(response);
}

// get all Volunteer Activity Hours
export async function getAllVolunteerActivityHoursHandler(
  req: Request & { user?: any },
  res: Response
) {
  const response = await getAllVolunteerActivityHours(req.body.limit);
  return res.status(200).json(response);
}

// approve Volunteering hours
export async function approveOrRejectVolunteeringHoursHandler(
  req: Request & { user?: any },
  res: Response
) {
  const response = await approveOrRejectVolunteeringHours(
    req.body.requestID,
    req.body.email,
    req.body.scholarshipID,
    req.body.decision,
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

// get Volunteer Hours by scholarshipID List
export async function getVolunteerHoursByScholarshipIDListHandler(
  req: Request & {
    user?: {
      decoded: UserSchema;
    };
  },
  res: Response
) {
  const response = await getVolunteerHoursByScholarshipIDList(
    req.body.scholarshipIDList,
    req.user.decoded
  );
  return res.status(200).json(response);
}
