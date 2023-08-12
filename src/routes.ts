import { Express, Request, Response } from "express";
import {
  googleOAuthHandler,
  getGoogleOAuthUrl,
} from "./controller/session.controller";
import { authHandler, getAllUsersHandler } from "./controller/user.controller";
import { requiredUser } from "./middleware/requireduser";
import {
  checkIfScholarshipIDExistsHandler,
  getScholarshipFormDataHandler,
  submitApplicationHandler,
} from "./controller/scholarshipForm.controller";

function routes(app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) =>
    res.status(200).json({ 1: "tester" })
  );

  app.get("/api/sessions/oauth/google", googleOAuthHandler);

  app.get("/api/v1/login/google", getGoogleOAuthUrl);

  app.get("/api/v1/auth/user", requiredUser, authHandler);

  app.get("/api/v1/protected/get/users", getAllUsersHandler);

  // scholarship form routes
  // check if scholarship ID exists
  app.get(
    "/api/v1/checkIfScholarshipIDExists",
    checkIfScholarshipIDExistsHandler
  );

  // submit scholarship form
  app.post("/api/v1/submitApplication", submitApplicationHandler);

  // get scholarship form data
  app.get("/api/v1/getScholarshipFormData", getScholarshipFormDataHandler);
}

export default routes;
