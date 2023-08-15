import { Express, Request, Response } from "express";
import { googleOAuthHandler, getGoogleOAuthUrl, createSessionHandler } from "./controller/session.controller";
import { authHandler, getAllUsersHandler } from "./controller/user.controller";
import { requiredUser } from "./middleware/requireduser";
import { isUserAuthorized } from "./middleware/authorisationCheck";

import { getUserByEmailId, createNewUser } from "./service/firebase.service";

function routes(app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) => res.status(200).json({ 1: "updated1" }));

  app.get("/api/sessions/oauth/google", googleOAuthHandler);

  app.get("/api/v1/login/google", getGoogleOAuthUrl);

  app.get("/api/v1/auth/user", requiredUser, authHandler);

  // app.get("/api/v1/protected/get/users", getAllUsersHandler);
  // app.get("/api/v1/create/session", createSessionHandler);
  app.get("/api/v1/protected/get/users", [requiredUser, isUserAuthorized], getAllUsersHandler);

  // app.post("/api/v1/submitApplication")
}

export default routes;
