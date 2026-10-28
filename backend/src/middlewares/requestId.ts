import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

const requestIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const forwardedRequestId = req.get("x-request-id")?.trim();
  const id =
    forwardedRequestId && requestIdPattern.test(forwardedRequestId)
      ? forwardedRequestId
      : randomUUID();

  res.locals.requestId = id;
  res.locals.startedAt = Date.now();
  res.setHeader("X-Request-Id", id);
  next();
};
