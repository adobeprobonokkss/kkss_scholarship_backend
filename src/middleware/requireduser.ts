import { Response, Request, NextFunction } from "express";
import { verifyJwt } from "./../utils/jwt.util";

export function requiredUser(req: any, res: Response, next: NextFunction) {
  try {
    const Token = req.cookies.accessToken;
    req.user = verifyJwt(Token);
    console.log("calling from middleware");
    console.log(req.user);
    next();
  } catch (error) {
    console.log(error);
    res.clearCookie("accessToken");
    return res.redirect("http://localhost:9000");
  }
}
