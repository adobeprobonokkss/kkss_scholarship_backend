import { CookieOptions, Request, Response } from "express";
import { getGoogleOAuthToken } from "./../service/user.service";
import { logger } from "./../utils/logger";
import { signjwt, verifyJwt } from "./../utils/jwt.util";
import config, { util } from "config";
import jwt from "jsonwebtoken";
import { getUserByEmailId, createNewUser } from "./../service/firebase.service";

const GOOGLE_CLIENT_ID = config.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = config.get("GOOGLE_CLIENT_SECRET");
const GOOGLE_REDIRECT_URL = config.get("GOOGLE_REDIRECT_URL");

const succesLoginUrl = `${config.get("FRONT_END_URL")}/login/success#`;
const errorLoginUrl = `${config.get("FRONT_END_URL")}/login/error#`;
const oAuthError = `${config.get("FRONT_END_URL")}/oauth/error`;

console.log(GOOGLE_REDIRECT_URL);
const accessTokenCookieOptions: CookieOptions = {
  maxAge: 300000,
  httpOnly: true,
  sameSite: "none",
  secure: true
};

const refershTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 3.154e10
};

export async function googleOAuthHandler(req: Request, res: Response) {
  res.header("Access-Control-Allow-Origin", config.get("FRONT_END_URL"));
  // res.header("Referrer-Policy", "no-referrer-when-downgrade");

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
      return res.redirect(`${succesLoginUrl}?token=${access_token}`);
    } else {
      logger.info("User not registred with application", isUserRegisterInApp);
      const isCreateNewUser: any = await createNewUser(user);
      return res.redirect(succesLoginUrl);
    }
  } catch (error: any) {
    logger.error("Getting error while in googleOauthHandler", error);
    return res.send(oAuthError);
  }
}

export async function createSessionHandler(req: Request, res: Response) {
  const receivedToken: any = req.query.token;
  // res.header("Access-Control-Allow-Origin", config.get("FRONT_END_URL"));
  res.setHeader("Access-Control-Allow-Origin", config.get("FRONT_END_URL"));
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // Include additional headers if needed
  res.setHeader("Access-Control-Expose-Headers", "X-Custom-Header");
  logger.info(`CreateSessionHandler Token ${receivedToken}`);
  if (receivedToken) {
    // const decodedInfo = verifyJwt(receivedToken);
    res.cookie("accessToken", receivedToken, accessTokenCookieOptions);
    logger.info("set the token in.......");
    res.status(200).json({ message: "Session Created SuccessFully" });
  } else {
    res.status(400).json({ error: "Session Not Created...." });
  }
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
