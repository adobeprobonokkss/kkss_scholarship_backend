import { Express, Request, Response } from "express";
import { isUserAuthorized } from "./middleware/authorisationCheck";
import {
  googleOAuthHandler,
  getGoogleOAuthUrl,
  logOut,
} from "./controller/session.controller";
import {
  authHandler,
  getAllUsersHandler,
  promoteUserRole,
} from "./controller/user.controller";
import { requiredUser } from "./middleware/requireduser";
import {
  approveOrRejectVolunteeringHoursHandler,
  checkIfScholarshipIDExistsHandler,
  getAllScholarshipFormDataHandler,
  getScholarshipFormDataHandler,
  getVolunteeringHoursHandler,
  reviewApplicationHandler,
  submitApplicationHandler,
  submitVolunteeringHoursHandler,
  getTotalCountHandler,
  getAllVolunteerActivityHoursHandler,
  getAllVolunteeringActivityHoursByUserHandler,
  getVolunteerActivityHoursByRequestIDHandler,
  getVolunteerHoursByScholarshipIDListHandler,
} from "./controller/scholarshipForm.controller";

function routes(app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) =>
    res.status(200).json({ 1: "tester" })
  );

  app.get("/api/sessions/oauth/google", googleOAuthHandler);

  app.get("/api/v1/login/google", getGoogleOAuthUrl);

  app.get("/api/v1/auth/user", requiredUser, authHandler);

  app.post("/api/v1/protected/logout", logOut);

  // scholarship form routes
  // check if scholarship ID exists
  app.post(
    "/api/v1/checkIfScholarshipIDExists",
    requiredUser,
    checkIfScholarshipIDExistsHandler
  );

  // submit scholarship form
  app.post("/api/v1/submitApplication", requiredUser, submitApplicationHandler);

  // get scholarship form data
  app.post(
    "/api/v1/getScholarshipFormData",
    requiredUser,
    getScholarshipFormDataHandler
  );

  app.get(
    "/api/v1/getScholarshipFormData",
    requiredUser,
    getScholarshipFormDataHandler
  );

  //get user applied scholarship data for dashboard

  // get all scholarship form data
  app.get(
    "/api/v1/getAllScholarshipFormData",
    requiredUser,
    getAllScholarshipFormDataHandler
  );

  // review application
  app.post("/api/v1/reviewApplication", requiredUser, reviewApplicationHandler);

  app.post(
    "/api/v1/protected/get/users",
    [requiredUser, isUserAuthorized],
    getAllUsersHandler
  );

  app.post(
    "/api/v1/protected/promoteUserRole",
    [requiredUser, isUserAuthorized],
    promoteUserRole
  );

  // submit volunteering hours
  app.post(
    "/api/v1/submitVolunteeringHours",
    requiredUser,
    submitVolunteeringHoursHandler
  );

  // get volunteering hours
  app.post(
    "/api/v1/getVolunteeringHours",
    requiredUser,
    getVolunteeringHoursHandler
  );

  // get all Volunteering Activity by user
  app.post(
    "/api/v1/getAllVolunteeringActivityHoursByUser",
    requiredUser,
    getAllVolunteeringActivityHoursByUserHandler
  );

  // get Volunteer Activity Hours by requestID
  app.post(
    "/api/v1/getVolunteerActivityHoursByRequestID",
    requiredUser,
    getVolunteerActivityHoursByRequestIDHandler
  );

  // get all Volunteer Activity Hours
  app.post(
    "/api/v1/getAllVolunteerActivityHours",
    requiredUser,
    getAllVolunteerActivityHoursHandler
  );

  // approve volunteering hours
  app.post(
    "/api/v1/approveOrRejectVolunteeringHours",
    requiredUser,
    approveOrRejectVolunteeringHoursHandler
  );

  // get Volunteer Hours by scholarshipID List
  app.post(
    "/api/v1/getVolunteerHoursByScholarshipIDList",
    requiredUser,
    getVolunteerHoursByScholarshipIDListHandler
  );

  app.post("/api/v1/protected/getCountHandler", getTotalCountHandler);
}

export default routes;
