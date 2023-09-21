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
  approveVolunteeringHoursHandler,
  checkIfScholarshipIDExistsHandler,
  getAllScholarshipFormDataHandler,
  getScholarshipFormDataHandler,
  getVolunteeringHoursHandler,
  reviewApplicationHandler,
  submitApplicationHandler,
  submitVolunteeringHoursHandler,
  getTotalCountHandler,
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
    checkIfScholarshipIDExistsHandler
  );

  // submit scholarship form
  app.post("/api/v1/submitApplication", submitApplicationHandler);

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
  app.post("/api/v1/reviewApplication", reviewApplicationHandler);

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

  // approve volunteering hours
  app.post(
    "/api/v1/approveVolunteeringHours",
    requiredUser,
    approveVolunteeringHoursHandler
  );
  app.post("/api/v1/protected/getCountHandler", getTotalCountHandler);
}

export default routes;
