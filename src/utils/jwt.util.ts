import config from "config";
import jwt from "jsonwebtoken";
const pirvateKey = config.get<string>("privateKey");
const publicKey = config.get<string>("publicKey");
export function signjwt(object: Object, options?: jwt.SignOptions | undefined) {
  console.log(pirvateKey);

  // return jwt.sign(object, pirvateKey, {
  //   ...(options && options),
  //   algorithm: "RS256"
  // });
  return jwt.sign(object, pirvateKey);
}

export function verifyJwt(token: string) {
  try {
    const decoded = jwt.verify(token, pirvateKey);
    return {
      valid: true,
      expired: false,
      decoded
    };
  } catch (error: any) {
    return {
      valid: false,
      expired: error.message === "jwt expired",
      decoded: null
    };
  }
}
