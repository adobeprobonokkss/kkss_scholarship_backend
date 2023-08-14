import { Response, Request, NextFunction } from "express";
import { verifyJwt } from "./../utils/jwt.util";
import { logger } from "./../utils/logger";

const HTTP_CODE_USER_NOT_AUTHORIZED = 401;
function isAuthorizedToAceess(endpoint: string, role: string) {
  return true;
}
export function isUserAuthorized(req: any, res: Response, next: NextFunction) {
  try {
    //check if user is authorized to access resource
    //if not redirect to unauthorize page
    // Algo
    // ferch role from db or either can pass role from client which ever is safer
    // check role
    // check endpoint
    const isUserAuthorized = isAuthorizedToAceess(req.path, "");
    req.isUserAuthorized = isUserAuthorized;
    next();
  } catch (error) {
    logger.error(error);
    req.isUserAuthorized = isUserAuthorized;
    next();
  }
}
