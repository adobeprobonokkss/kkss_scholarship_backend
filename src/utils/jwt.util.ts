import config from "config";
import jwt, { JwtPayload } from "jsonwebtoken";
const pirvateKey = process.env.publicKey;
const publicKey = process.env.publicKey;
import { logger } from "./logger";

interface user {
  name: string;
  email: string;
  picture: string;
}

interface userSession {
  valid: boolean;
  expired: boolean;
  decoded: user | null;
}

// Function to map JwtPayload to CustomUser
function mapJwtPayloadToCustomUser(payload: user): userSession {
  return {
    valid: true,
    expired: false,
    decoded: payload,
  };
}

export function signjwt(object: Object, options?: jwt.SignOptions | undefined) {
  // return jwt.sign(object, pirvateKey, {
  //   ...(options && options),
  //   algorithm: "RS256"
  // });
  return jwt.sign(object, pirvateKey);
}

export function verifyJwt(token: string): userSession {
  try {
    const decoded = jwt.verify(token, pirvateKey) as JwtPayload as user;
    return mapJwtPayloadToCustomUser(decoded) as userSession;
  } catch (error: any) {
    const isexpired = error.message === "jwt expired";
    if (isexpired) logger.debug("Jwt expired for user.....");
    else logger.error("Error encoutered", error);
    return {
      valid: false,
      expired: isexpired,
      decoded: null,
    };
  }
}
