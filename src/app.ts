import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "config";
import { logger } from "./utils/logger";
import routes from "./routes";
const functions = require("firebase-functions");
var RateLimit = require("express-rate-limit");

const app = express();
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: config.get("FRONT_END_URL"), credentials: true }));

app.use(express.json());
app.use(cookieParser());

routes(app);
app.use(limiter);

logger.info("app is listening");

const port = 1337;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

exports.kkssCloudFunctions = functions
  .region("asia-south1")
  .https.onRequest(app);
