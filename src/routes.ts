import { Express, Request, Response } from "express";
import { isUserAuthorized } from "./middleware/authorisationCheck";
import {
  googleOAuthHandler,
  getGoogleOAuthUrl,
  logOut,
} from "./controller/session.controller";
import { authHandler, getAllUsersHandler } from "./controller/user.controller";
import { requiredUser } from "./middleware/requireduser";
import {
  checkIfScholarshipIDExistsHandler,
  getAllScholarshipFormDataHandler,
  getScholarshipFormDataHandler,
  reviewApplicationHandler,
  submitApplicationHandler,
} from "./controller/scholarshipForm.controller";

function routes(app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) =>
    res.status(200).json({ 1: "tester" })
  );

  app.get("/api/sessions/oauth/google", googleOAuthHandler);

  app.get("/api/v1/login/google", getGoogleOAuthUrl);

  app.get("/api/v1/auth/user", requiredUser, authHandler);

  app.post("/api/v1/protected/logout", logOut);

  // app.get("/api/v1/protected/get/users", getAllUsersHandler);
  // app.get("/api/v1/create/session", createSessionHandler);
  app.get(
    "/api/v1/protected/get/users",
    [requiredUser, isUserAuthorized],
    getAllUsersHandler
  );

  // scholarship form routes
  // check if scholarship ID exists
  app.post(
    "/api/v1/checkIfScholarshipIDExists",
    checkIfScholarshipIDExistsHandler
  );

  // submit scholarship form
  app.post("/api/v1/submitApplication", submitApplicationHandler);

  // get scholarship form data
  app.post("/api/v1/getScholarshipFormData", getScholarshipFormDataHandler);

  // get all scholarship form data
  app.get(
    "/api/v1/getAllScholarshipFormData",
    getAllScholarshipFormDataHandler
  );

  // review application
  app.post("/api/v1/reviewApplication", reviewApplicationHandler);
}

export default routes;
