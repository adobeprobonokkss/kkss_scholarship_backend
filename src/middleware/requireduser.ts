import { Response, Request, NextFunction } from "express";
import { verifyJwt } from "./../utils/jwt.util";
import { logger } from "./../utils/logger";
import config from "config";

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export async function requiredUser(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    const userSessionInfo = verifyJwt(accessToken);

    if (userSessionInfo.expired) {
      logger.info(
        "JWT token has expired.. creatng a new token, Not implemented yet"
      );
      req.user = {
        valid: false,
        message: "JWT token is not expired,plese login again",
      };
      return res.status(401).json({ msg: "USER_ACCESS_TOKEN_EXPIRED" });
    } else if (!userSessionInfo.valid) {
      logger.info("JWT token is not valid......");
      req.user = {
        valid: false,
        message: "JWT token is not valid,plese login again",
      };
      return res.status(401).json({ msg: "USER_IS_NOT_AUTHUNTICATED" });
    } else req.user = userSessionInfo;
    next();
  } catch (error) {
    logger.error("Encoutered error in requiredUser MiddleWare", error);
    res.clearCookie("accessToken");
    return res.redirect(config.get("FRONT_END_URL"));
  }
}
