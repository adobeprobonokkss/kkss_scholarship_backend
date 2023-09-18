const LOCAL_BACKEND_URL = "http://localhost:1337";
const PROD_BACKEND_URL =
  "https://asia-south1-kkss-5a230.cloudfunctions.net/kkssCloudFunctions";
const baseBackendURL = PROD_BACKEND_URL;

const LOCAL_FRONTEND_URL = "http://localhost:9000";
const PROD_FRONTEND_URL = "https://kkss-5a230.web.app";
const baseFrontendURL = PROD_FRONTEND_URL;

export default {
  origin: "*",
  port: 1337,
  dbUri: "",
  GOOGLE_CLIENT_ID:
    "578642137246-6algulvf7bam990235ckkk71p5he6lgi.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "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",
  GOOGLE_REDIRECT_URL: `${baseBackendURL}/api/sessions/oauth/google`,
  privateKey: `testfdafad`,

  publicKey: `-----BEGIN PUBLIC KEY-----
  MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCaYm7eUkTgIeTcwD3rFicPa969
  AOThXBlwKY7qoSjVeeV2jZJ5L+GMTzAsgH24fzW/de4E6oG3JT32oNhVoJCHoeWz
  NwRpCsw1hKX+pTa2J8Y4KJB87PBsvzpAJ3J/Buyba8ET1B/RZK5l532pXPzYgLYZ
  WgUdAvVweE/yGPJY1wIDAQAB
  -----END PUBLIC KEY-----`,
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
