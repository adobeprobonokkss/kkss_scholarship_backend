import { CookieOptions, Request, Response } from "express";
import escape from "escape-html";
import { getGoogleOAuthToken } from "./../service/user.service";
import { logger } from "./../utils/logger";
import { signjwt, verifyJwt } from "./../utils/jwt.util";
import config, { util } from "config";
import jwt from "jsonwebtoken";
import { getUserByEmailId, createNewUser } from "./../service/firebase.service";

const GOOGLE_CLIENT_ID = config.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = config.get("GOOGLE_CLIENT_SECRET");
const GOOGLE_REDIRECT_URL = config.get("GOOGLE_REDIRECT_URL");

const succesLoginUrl = `${config.get("FRONT_END_URL")}`;
const errorLoginUrl = `${config.get("FRONT_END_URL")}/#/login/error`;
const oAuthError = `${config.get("FRONT_END_URL")}/#/oauth/error`;

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 1000 * 60 * 60,
  httpOnly: true,
  sameSite: "none",
  secure: true,
};

const refershTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 3.154e10,
};

export async function googleOAuthHandler(req: Request, res: Response) {
  res.header("Access-Control-Allow-Origin", config.get("FRONT_END_URL"));
  // res.header("Referrer-Policy", "no-referrer-when-downgrade");

  try {
    const code = req.query.code as string;

    const stateReturnedFromOauth = req.query.state ?? "";
    logger.info("State Vlaue -", req.query);
    const { id_token, access_token } = await getGoogleOAuthToken({ code });

    const userInfo: any = jwt.decode(id_token);
    logger.info("Getting User Info From Google ", userInfo);
    if (!userInfo.email_verified) {
      logger.info("Email is not veerified for user..", userInfo.email);
      return res.status(403).send("Your enamil is not verified...."); //handle error for UI
    }

    const { name, email, picture } = userInfo;

    const isUserRegisterInApp = await getUserByEmailId(email);
    let user = null;
    if (isUserRegisterInApp) {
      user = isUserRegisterInApp;
    } else {
      const defaultRole = "USER";
      user = { name, email: email, picture, role: defaultRole };
    }

    // const user: any = { name, email, picture, role: defaultRole };
    logger.info("Created user object with userDetails - ", user);
    logger.info("creating access token and refresh token for session control");
    const accessTokenTtl: string = config.get("accessTokenTtl");
    const refereshTokenTtl: string = config.get("refreshTokenTtl");
    const app_access_token = signjwt(
      { ...user },
      { expiresIn: accessTokenTtl }
    );
    const app_refresh_token = signjwt(
      { ...user },
      { expiresIn: refereshTokenTtl }
    );
    logger.info("setting accessToken and refreshToken in headers");
    res.cookie("accessToken", app_access_token, accessTokenCookieOptions);
    res.cookie("refreshToken", app_refresh_token, refershTokenCookieOptions);
    res.set("x-access-token", app_access_token);
    logger.info("setting x-access-token.... ");

    // const isUserRegisterInApp = await getUserByEmailId(user.email);
    if (isUserRegisterInApp) {
      logger.info("User already registerd in application", isUserRegisterInApp);
      logger.info("Redirecting to User Dashboard....");
      return res.redirect(`${succesLoginUrl}?token=${stateReturnedFromOauth}`);
    } else {
      logger.info("User not registred with application", isUserRegisterInApp);
      const isCreateNewUser: any = await createNewUser(user);
      return res.redirect(`${succesLoginUrl}?token=${stateReturnedFromOauth}`);
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
  const receivedState: any = escape(req.query.state as string);
  logger.info("Received State Escape Value - ", receivedState);
  logger.info("Received State Value - ", req.query.state);

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: GOOGLE_REDIRECT_URL as string,
    client_id: GOOGLE_CLIENT_ID as string,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };
  const qs = new URLSearchParams(options);
  logger.debug("getGoogleOAuthUrl retrung code ", qs.toString());
  return res.send(`${rootUrl}?${qs.toString()}&state=${receivedState}`);
}

export function logOut(req: Request, res: Response) {
  try {
    logger.info("setting accessToken and refreshToken in headers");
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    // res.removeHeader("x-access-token");
    logger.info("Logout Called from Backend seerver");
    res.send(200);
  } catch (error: any) {
    logger.error("Getting error while in LogOut", error);
    res.status(200);
    return res.send("Getting Some Error");
  }
}
