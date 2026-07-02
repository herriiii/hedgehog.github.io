import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser(process.env["SESSION_SECRET"] || "hedgehog-secret"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple cookie-based session middleware
app.use((req: any, _res, next) => {
  const sessionData = (req as any).signedCookies?.["session"];
  req.session = sessionData ? JSON.parse(sessionData) : {};
  req.session.save = (cb?: () => void) => cb?.();
  req.session.destroy = () => { req.session = {}; };
  next();
});

// Save session to cookie after each request
app.use((req: any, res: any, next) => {
  const origEnd = res.end.bind(res);
  res.end = (...args: any[]) => {
    if (req.session && Object.keys(req.session).some(k => k !== "save" && k !== "destroy")) {
      const payload: any = {};
      for (const [k, v] of Object.entries(req.session)) {
        if (k !== "save" && k !== "destroy") payload[k] = v;
      }
      res.cookie("session", JSON.stringify(payload), {
        signed: true,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      });
    }
    return origEnd(...args);
  };
  next();
});

app.use("/api", router);

export default app;
