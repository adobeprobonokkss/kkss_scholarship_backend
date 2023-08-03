import { Express, Request, Response } from "express";
import { googleOAuthHandler, getGoogleOAuthUrl } from "./controller/session.controller";
import { authHandler } from "./controller/user.controller";
import { requiredUser } from "./middleware/requireduser";

import { getUserByEmailId, createNewUser } from "./service/firebase.service";

function routes(app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) => res.status(200).json({ 1: "tester" }));

  app.get("/api/sessions/oauth/google", googleOAuthHandler);

  app.get("/api/v1/login/google", getGoogleOAuthUrl);

  app.get("/api/v1/auth/user", requiredUser, authHandler);

  // app.get("/api/v1/getUser", async (req: Request, res: Response) => {
  //   console.log("reqeust getting");
  //   const users = await getUserByEmailId("pradeepkmr838@gmail.com");
  //   res.status(200).json(users);
  // });

  // app.get("/api/v1/createUser", async (req: Request, res: Response) => {
  //   console.log("reqeust getting");
  //   const user: any = { email: "pradeepkmr838@gmail.com", name: "pradeep kumar", picture: "" };
  //   const users = await createNewUser(user);
  //   res.status(200).json(users);
  // });
}

export default routes;
