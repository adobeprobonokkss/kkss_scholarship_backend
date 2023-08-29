import { Response, Request, NextFunction } from "express";
import { logger } from "./../utils/logger";
import { RoleType } from "./../utils/types";

const HTTP_CODE_USER_NOT_AUTHORIZED = 401;

function isAuthorizedToAceess(current_endpoint: string, role: string) {
  const only_accessible_to_role_admin = [
    "/api/v1/protected/promoteUserRole",
    "/api/v1/protected/get/users",
  ];
  const only_accessible_to_role_pm = [""];
  const only_accessible_to_rol_vol = [""];
  console.log(RoleType.ADMIN);
  if (role === RoleType.ADMIN) {
    return true;
  } else if (role === RoleType.PROGRAM_MANAGER) {
    if (only_accessible_to_role_admin.includes(current_endpoint)) return false;
    else return true;
  } else if (role === RoleType.VOLUNTEER) {
    if (
      only_accessible_to_role_admin.includes(current_endpoint) ||
      only_accessible_to_role_pm.includes(current_endpoint)
    )
      return false;
    else return true;
  } else if (role === RoleType.USER) {
    if (
      only_accessible_to_role_admin.includes(current_endpoint) ||
      only_accessible_to_role_pm.includes(current_endpoint) ||
      only_accessible_to_rol_vol.includes(current_endpoint)
    )
      return false;
    else return true;
  } else return false;
}
export function isUserAuthorized(req: any, res: Response, next: NextFunction) {
  try {
    const isUserAuthorized = isAuthorizedToAceess(
      req.path,
      req.user.decoded.role
    );
    req.isUserAuthorized = isUserAuthorized;
    console.log(`user ${req.user} is  authorised :`, req.isUserAuthorized);
    if (req.isUserAuthorized) next();
    else return res.status(401).json({ msg: "USER_IS_NOT_AUTHORIZED" });
  } catch (error) {
    console.error(error);
    logger.error(error);
    req.isUserAuthorized = false;
    return res.status(401).json({ msg: "USER_IS_NOT_AUTHORIZED" });
  }
}
