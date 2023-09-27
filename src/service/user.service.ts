import config from "config";
import axios from "axios";
import QueryString from "qs";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "../controller/session.controller";

interface GoogleTokentResults {
  access_token: string;
  refresh_token: string;
  scope: string;
  id_token: string;
  expires_in: number;
}

export async function getGoogleOAuthToken({
  code,
}: {
  code: string;
}): Promise<GoogleTokentResults> {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: config.get("GOOGLE_REDIRECT_URL"),
    grant_type: "authorization_code",
  };
  //

  try {
    const res = await axios.post<GoogleTokentResults>(
      url,
      QueryString.stringify(values),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    //
    if (!(res.data.access_token && res.data.id_token)) {
      throw new Error("something happen while authoorizing" + res.status);
    }

    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch goolge oAuthTokens..");
    throw Error(error);
  }
}
