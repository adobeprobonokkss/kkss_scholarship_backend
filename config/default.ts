const environment: string = "production";
const LOCAL_BACKEND_URL = "http://localhost:1337";
const PROD_BACKEND_URL =
  "https://asia-south1-kkss-5a230.cloudfunctions.net/kkssCloudFunctions";
const baseBackendURL =
  environment === "development" ? LOCAL_BACKEND_URL : PROD_BACKEND_URL;

const LOCAL_FRONTEND_URL = "http://localhost:9000";
const PROD_FRONTEND_URL = "https://kkss-5a230.web.app";
const baseFrontendURL =
  environment === "development" ? LOCAL_FRONTEND_URL : PROD_FRONTEND_URL;

export default {
  origin: "*",
  port: 1337,
  dbUri: "",
  GOOGLE_REDIRECT_URL: `${baseBackendURL}/api/sessions/oauth/google`,
  privateKey: `testfdafad`,
  accessTokenTtl: "60m",
  refreshTokenTtl: "1y",
  FIREBASE_DB_CONFIG: {
    apiKey: "AIzaSyCpuU7tJgSciOLdUB-fVJsRaSpDRD72NJs",
    authDomain: "kkss-5a230.firebaseapp.com",
    projectId: "kkss-5a230",
    storageBucket: "kkss-5a230.appspot.com",
    messagingSenderId: "578642137246",
    appId: "1:578642137246:web:da939c030664ab4c00eb8f",
  },
  FRONT_END_URL: baseFrontendURL,
};
