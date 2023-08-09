import { CookieOptions, Request, Response } from "express";
import { getGoogleOAuthToken } from "./../service/user.service";
import { logger } from "./../utils/logger";
import { signjwt } from "./../utils/jwt.util";
import config from "config";
import jwt from "jsonwebtoken";
import { getUserByEmailId, createNewUser } from "./../service/firebase.service";

const GOOGLE_CLIENT_ID = config.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = config.get("GOOGLE_CLIENT_SECRET");
const GOOGLE_REDIRECT_URL = config.get("GOOGLE_REDIRECT_URL");

const succesLoginUrl = "http://localhost:9000/login/success#";
const errorLoginUrl = "http://localhost:9000/login/error#";
const oAuthError = `${config.get("origin")}/oauth/error`;

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 30000,
  httpOnly: true,
  domain: "localhost",
  path: "/",
  sameSite: "lax",
  secure: false
};

const refershTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 3.154e10
};

export async function googleOAuthHandler(req: Request, res: Response) {
  res.header("Acess-Control-Allow-Origin", config.get("FRONT_END_URL"));
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  try {
    const code = req.query.code as string;
    const { id_token, access_token } = await getGoogleOAuthToken({ code });

    const userInfo: any = jwt.decode(id_token); // pradeepkmr838 -implementation needs to change here call 44/14
    logger.info("Getting user from google oauth - ", userInfo);
    if (!userInfo.email_verified) {
      logger.info("Email is not veerified for user..", userInfo.email);
      return res.status(403).send("Your enamil is not verified...."); //handle error for UI
    }

    const { name, email, picture } = userInfo;

    const user: any = { name, email, picture };
    logger.info("creating user object with this ", user);
    const app_access_token = signjwt({ ...user }, { expiresIn: config.get("accessTokenTtl") });
    const app_refresh_token = signjwt({ ...user }, { expiresIn: config.get("refreshTokenTtl") });

    res.cookie("accessToken", app_access_token, accessTokenCookieOptions);
    res.cookie("refreshToken", app_refresh_token, refershTokenCookieOptions);
    res.set("x-access-token", app_access_token);

    const isUserRegisterInApp = await getUserByEmailId(user.email);
    if (isUserRegisterInApp) {
      logger.info("User already registerd....", isUserRegisterInApp);
      return res.redirect(succesLoginUrl);
    } else {
      logger.info("User not registred with application", isUserRegisterInApp);
      console.log("User not registred with application", isUserRegisterInApp);
      const isCreateNewUser: any = await createNewUser(user);
      return res.redirect(succesLoginUrl);
    }
  } catch (error: any) {
    logger.error("Getting error while in googleOauthHandler", error);
    return res.send(oAuthError);
  }
}

export async function createSessionHandler(req: Request, res: Response) {
  // const session=
}

export async function getGoogleOAuthUrl(req: Request, res: Response) {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: GOOGLE_REDIRECT_URL as string,
    client_id: GOOGLE_CLIENT_ID as string,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"].join(" ")
  };
  const qs = new URLSearchParams(options);
  logger.debug("getGoogleOAuthUrl retrung code ", qs.toString());
  return res.send(`${rootUrl}?${qs.toString()}`);
}
