import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "config";
import { logger } from "./utils/logger";
import routes from "./routes";
const functions = require("firebase-functions");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: config.get("FRONT_END_URL"), credentials: true }));

app.use(express.json());
app.use(cookieParser());

routes(app);

logger.info("app is listening");

const port = 1337;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

exports.kkssCloudFunctions = functions
  .region("asia-south1")
  .https.onRequest(app);
