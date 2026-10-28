import express from "express";
import request from "supertest";
import app from "../app";
import { loginRateLimit } from "../middlewares/loginRateLimit";

describe("controles de seguridad HTTP", () => {
  test("limita intentos repetidos únicamente en el middleware de login", async () => {
    const limitedApp = express();
    limitedApp.post("/login", loginRateLimit, (_req, res) => {
      res.status(200).json({ status: "accepted" });
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await request(limitedApp).post("/login");
      expect(response.status).toBe(200);
    }

    const response = await request(limitedApp).post("/login");
    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Demasiados intentos. Inténtalo nuevamente más tarde.",
        details: [],
      },
    });
    expect(response.headers["ratelimit-limit"]).toBe("5");
  });

  test("rechaza cuerpos JSON superiores al límite sin exponer errores internos", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("content-type", "application/json")
      .send(JSON.stringify({ value: "x".repeat(1024 * 1024 + 1) }));

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe("PAYLOAD_TOO_LARGE");
    expect(JSON.stringify(response.body)).not.toContain("entity.too.large");
  });
});
