import { CookieOptions, Request, Response } from "express";
import { getGoogleOAuthToken } from "./../service/user.service";
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
  maxAge: 90000,
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
  res.header("Acess-Control-Allow-Origin", "http://localhost:9000");
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  try {
    const code = req.query.code as string;
    //get the user tokens
    const { id_token, access_token } = await getGoogleOAuthToken({ code });
    // console.log(id_token, access_token);

    const userInfo: any = jwt.decode(id_token); // pradeepkmr838 -implementation needs to change here call 44/14
    // console.log({ userInfo });
    if (!userInfo.email_verified) {
      return res.status(403).send("Your enamil is not verified....");
    }
    //if user does not exist create new one
    const { name, email, picture } = userInfo;

    //fetch userid from firebase data to create a session and based on that accesstoken and referesh token will be created

    //temp code
    const user: any = { name, email, picture };
    console.log(user);
    const app_access_token = signjwt({ ...user }, { expiresIn: config.get("accessTokenTtl") });
    const app_refresh_token = signjwt({ ...user }, { expiresIn: config.get("refreshTokenTtl") });
    res.cookie("accessToken", app_access_token, accessTokenCookieOptions);
    res.cookie("refreshToken", app_refresh_token, refershTokenCookieOptions);
    console.log("user is Loggd in");
    // return res.json({ app_access_token, app_refresh_token });
    // return res.redirect(`http://${config.get("origin")}/scholarship-form`);
    res.set("x-access-token", app_access_token);

    //get the user
    const isUserRegisterInApp = await getUserByEmailId(user.name);
    console.log(isUserRegisterInApp);
    if (isUserRegisterInApp.length == 0) {
      const isCreateNewUser: any = await createNewUser(user);
      return res.redirect(succesLoginUrl);
    } else if (isUserRegisterInApp.length == 1) {
      console.log("User already registerd....", isUserRegisterInApp[0]);
      return res.redirect(succesLoginUrl);
    }
  } catch (error: any) {
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
  console.log(options);

  const qs = new URLSearchParams(options);
  console.log(qs.toString());
  return res.send(`${rootUrl}?${qs.toString()}`);
}
