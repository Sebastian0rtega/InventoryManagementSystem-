import request from "supertest";
import app from "../app";
import sequelize from "../config/db";

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
});
