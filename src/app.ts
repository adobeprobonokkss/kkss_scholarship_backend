// src/app.ts
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("wecome setup!");
});

export default app;
