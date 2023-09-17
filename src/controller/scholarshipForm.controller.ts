import { Request, Response } from "express";
import {
  checkIfScholarshipIDExists,
  getAllScholarshipFormData,
  getScholarshipFormData,
  saveScholarshipFormData,
  updateScholarshipFormData,
  getCountOfScholarShipData,
} from "../service/firebase.service";
import { RoleType } from "./../utils/types";

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
  // if (req.user.decoded.role == RoleType.USER) {
  //   const response = await getScholarshipFormData(
  //     {
  //       field: "email",
  //       keyword: req.user.decoded.email,
  //       year: null,
  //       status: null,
  //     },
  //     req.user.decoded
  //   );

  //   return res.status(200).json(response);
  // } else if (req.user.decoded.role == RoleType.REVIEWER) {
  //   const response = await getScholarshipFormData(
  //     {
  //       field: "backgroundVerifierEmail",
  //       keyword: req.user.decoded.email,
  //       year: null,
  //       status: null,
  //     },
  //     req.user.decoded
  //   );
  //   return res.status(200).json(response);
  // } else {
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

export async function getTotalCountHandler(req: any, res: Response) {
  // return res.status(200).json({});
  console.log(req.body.year);
  const year = req.body.year;
  const status = req.body.status;
  console.log(year, status);
  const response = await getCountOfScholarShipData(year, status);
  return res.status(200).json(response);
}
