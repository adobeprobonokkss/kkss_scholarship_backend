import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "config";
import { logger } from "./utils/logger";
import routes from "./routes";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(cors({ origin: "localhost:9000", credentials: true }));
app.use(cors({ origin: "http://localhost:9000", credentials: true }));

app.use(express.json());
app.use(cookieParser());

routes(app);

logger.info("app is listening");

export default app;
