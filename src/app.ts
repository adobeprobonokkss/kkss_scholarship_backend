import express from "express";
import routes from "./routes";
import { logger } from "./utils/logger";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:9000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
routes(app);

logger("app is listening");

export default app;
