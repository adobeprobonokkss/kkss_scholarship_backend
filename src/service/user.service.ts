import config from "config";
import axios from "axios";
import QueryString from "qs";

interface GoogleTokentResults {
  access_token: string;
  refresh_token: string;
  scope: string;
  id_token: string;
  expires_in: number;
}

export async function getGoogleOAuthToken({ code }: { code: string }): Promise<GoogleTokentResults> {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: config.get("GOOGLE_CLIENT_ID"),
    client_secret: config.get("GOOGLE_CLIENT_SECRET"),
    redirect_uri: config.get("GOOGLE_REDIRECT_URL"),
    grant_type: "authorization_code"
  };
  console.log(values);

  try {
    const res = await axios.post<GoogleTokentResults>(url, QueryString.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    console.log(res);
    if (!(res.data.access_token && res.data.id_token)) {
      throw new Error("something happen while authoorizing" + res.status);
    }

    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch goolge oAuthTokens..");
    throw Error(error);
  }
}
