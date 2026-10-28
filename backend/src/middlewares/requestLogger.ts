import { Request, Response, NextFunction } from "express";
import { writeOperationalLog } from "../utils/operationalLogger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.on("finish", () => {
    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    const routePath = req.route?.path;
    const route = routePath ? `${req.baseUrl}${routePath}` : "unmatched";

    writeOperationalLog({
      level,
      event: "http.request",
      requestId: res.locals.requestId,
      method: req.method,
      route,
      status,
      durationMs: Date.now() - res.locals.startedAt,
      ...(res.locals.errorCode ? { errorCode: res.locals.errorCode } : {}),
    });
  });

  next();
};
