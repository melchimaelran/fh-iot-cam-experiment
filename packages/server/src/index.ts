import express from "express";
import cors from "cors";
import { appRouter } from "./router.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { env } from "./env.js";

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  }),
);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
