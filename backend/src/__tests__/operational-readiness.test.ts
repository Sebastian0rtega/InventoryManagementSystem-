import express from "express";
import request from "supertest";
import app from "../app";
import sequelize from "../config/db";
import { errorHandler } from "../middlewares/errorHandler";
import { requestId } from "../middlewares/requestId";
import { requestLogger } from "../middlewares/requestLogger";

describe("contratos operativos", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("liveness responde sin consultar PostgreSQL y correlaciona el request ID", async () => {
    const authenticate = jest
      .spyOn(sequelize, "authenticate")
      .mockResolvedValue(undefined);
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    const forwardedId = "a41b1ed3-2b64-46c8-a0fb-4cf652e8b307";

    const response = await request(app)
      .get("/api/health?access_token=do-not-log")
      .set("x-request-id", forwardedId);

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toBe(forwardedId);
    expect(response.body).toEqual({
      status: "ok",
      service: "inventory-api",
    });
    expect(authenticate).not.toHaveBeenCalled();

    const accessLog = JSON.parse(log.mock.calls[0][0] as string);
    expect(accessLog).toMatchObject({
      event: "http.request",
      requestId: forwardedId,
      method: "GET",
      route: "/api/health",
      status: 200,
    });
    expect(JSON.stringify(accessLog)).not.toContain("do-not-log");
  });

  test("reemplaza un request ID inválido por un UUID nuevo", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);

    const response = await request(app)
      .get("/api/health")
      .set("x-request-id", "Bearer secret-token-value");

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(log.mock.calls[0][0]).not.toContain("secret-token-value");
  });

  test("readiness informa indisponibilidad sin exponer errores del driver", async () => {
    const databaseError =
      "connection failed for user admin with password private-db-secret";
    const authenticate = jest
      .spyOn(sequelize, "authenticate")
      .mockRejectedValue(new Error(databaseError));
    const errorLog = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const response = await request(app).get("/api/health/database");

    expect(authenticate).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: "disconnected",
      message: "No se pudo conectar a la base de datos.",
    });
    expect(JSON.stringify(response.body)).not.toContain("private-db-secret");
    expect(errorLog.mock.calls.some(([line]) => line.includes(databaseError))).toBe(
      true,
    );
  });

  test("los errores internos conservan una respuesta pública segura y registran detalle en el servidor", async () => {
    const internalError = "database password must-not-reach-client";
    const errorLog = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const testApp = express();
    testApp.use(requestId);
    testApp.use(requestLogger);
    testApp.get("/failure", (_req, _res, next) => {
      next(new Error(internalError));
    });
    testApp.use(errorHandler);

    const response = await request(testApp)
      .get("/failure")
      .set("x-request-id", "a41b1ed3-2b64-46c8-a0fb-4cf652e8b307");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ha ocurrido un error inesperado en el servidor.",
        details: [],
      },
    });
    expect(JSON.stringify(response.body)).not.toContain(internalError);

    const internalLog = errorLog.mock.calls
      .map(([line]) => JSON.parse(line as string))
      .find((entry) => entry.event === "http.unhandled_error");
    expect(internalLog).toMatchObject({
      level: "error",
      requestId: "a41b1ed3-2b64-46c8-a0fb-4cf652e8b307",
      method: "GET",
      route: "/failure",
      status: 500,
      errorCode: "INTERNAL_SERVER_ERROR",
      errorMessage: internalError,
    });
    expect(internalLog.durationMs).toEqual(expect.any(Number));
  });
});
