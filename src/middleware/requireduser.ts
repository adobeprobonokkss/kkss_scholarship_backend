import { Response, Request, NextFunction } from "express";
import { verifyJwt } from "./../utils/jwt.util";
import { logger } from "./../utils/logger";
import config from "config";

export async function requiredUser(req: any, res: Response, next: NextFunction) {
  // const developmentFlag = await config.get("developmentFlag");
  // if (developmentFlag) {
  //   console.log("Running in development mode");
  //   // req.user = {
  //   //   valid: true,
  //   //   expired: false,
  //   //   decoded: "some decoded payload here "
  //   // };
  //   next();
  //   console.log("after next method...");
  //   return;
  // }

  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    const userSessionInfo = verifyJwt(accessToken);

    if (userSessionInfo.expired) {
      logger.inof("JWT token has expired.. creatng a new token, Not implemented yet");
      req.user = { valid: false, message: "JWT token is not expired,plese login again" };
    } else if (!userSessionInfo.valid) {
      logger.info("JWT token is not valid......");
      req.user = { valid: false, message: "JWT token is not valid,plese login again" };
      return res.status(401).json({ msg: "NOT_AUTHUNTICATED" });
    } else req.user = userSessionInfo;
    next();
  } catch (error) {
    console.log(error);
    res.clearCookie("accessToken");
    return res.redirect(config.get("FRONT_END_URL"));
  }
}
