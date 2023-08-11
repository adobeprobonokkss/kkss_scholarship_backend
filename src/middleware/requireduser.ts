import { Response, Request, NextFunction } from "express";
import { verifyJwt } from "./../utils/jwt.util";
import { logger } from "./../utils/logger";
export function requiredUser(req: any, res: Response, next: NextFunction) {
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
    } else req.user = userSessionInfo;
    console.log(req.user);
    next();
  } catch (error) {
    console.log(error);
    res.clearCookie("accessToken");
    return res.redirect("http://localhost:9000");
  }
}
