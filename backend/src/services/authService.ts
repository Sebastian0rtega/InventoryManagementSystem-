import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UniqueConstraintError } from "sequelize";
import { Usuario, Rol, Tienda } from "../models";
import { env } from "../config/env";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";
import type { UsuarioAttributes } from "../models";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROL_VENDEDOR = "Vendedor";
const TIENDA_CASA_MATRIZ = "Casa Matriz";

export interface RegisterInput {
  email: unknown;
  nombre: unknown;
  password: unknown;
}

export interface LoginInput {
  email: unknown;
  password: unknown;
}

export interface JwtPayload {
  id: number;
  rol: number;
}

/** Usuario expuesto en la API, sin el password_hash. */
export type PublicUser = Omit<UsuarioAttributes, "password_hash">;

/** Valida que un valor sea un string no vacío. */
function assertString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new ValidationError("Invalid request data", [
      `${fieldName} debe ser un texto (string).`,
    ]);
  }
  return value;
}

export async function register(input: RegisterInput): Promise<PublicUser> {
  // 1. Validar tipos antes de usar .trim()/.length
  const rawEmail = assertString(input.email, "email");
  const rawNombre = assertString(input.nombre, "nombre");
  const rawPassword = assertString(input.password, "password");

  const email = rawEmail.trim().toLowerCase();
  const nombre = rawNombre.trim();

  const details: unknown[] = [];

  if (!email) details.push("email es requerido.");
  if (!nombre) details.push("nombre es requerido.");
  if (!rawPassword) details.push("password es requerido.");

  if (!email) {
    throw new ValidationError("Invalid request data", details);
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError("Invalid request data", ["Formato de email inválido."]);
  }
  if (rawPassword.length < 6) {
    throw new ValidationError("Invalid request data", [
      "La contraseña debe tener al menos 6 caracteres.",
    ]);
  }

  // 2. Buscar rol Vendedor y tienda Casa Matriz (sin IDs fijos)
  const [rolVendedor, tiendaCasaMatriz] = await Promise.all([
    Rol.findOne({ where: { nombre_rol: ROL_VENDEDOR } }),
    Tienda.findOne({ where: { nombre: TIENDA_CASA_MATRIZ } }),
  ]);

  if (!rolVendedor) {
    throw new NotFoundError("No se encontró el rol Vendedor en la base de datos.");
  }
  if (!tiendaCasaMatriz) {
    throw new NotFoundError("No se encontró la tienda Casa Matriz en la base de datos.");
  }

  const passwordHash = await bcrypt.hash(rawPassword, 10);

  try {
    const newUser = await Usuario.create({
      email,
      nombre,
      password_hash: passwordHash,
      rol_id: rolVendedor.rol_id,
      tienda_id: tiendaCasaMatriz.tienda_id,
    });

    return newUser.toPublicJSON();
  } catch (error) {
    // Duplicado detectado a nivel de base de datos (race-condition-safe)
    if (error instanceof UniqueConstraintError) {
      throw new ConflictError("El email ya está registrado.");
    }
    throw error;
  }
}

export async function login(input: LoginInput): Promise<{ token: string }> {
  const rawEmail = assertString(input.email, "email");
  const rawPassword = assertString(input.password, "password");

  const email = rawEmail.trim().toLowerCase();

  if (!email || !rawPassword) {
    throw new ValidationError("Invalid request data", [
      "email y password son requeridos.",
    ]);
  }

  const user = await Usuario.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedError("Credenciales inválidas.");
  }

  const isValid = await bcrypt.compare(rawPassword, user.password_hash);
  if (!isValid) {
    throw new UnauthorizedError("Credenciales inválidas.");
  }

  const payload: JwtPayload = { id: user.usuario_id, rol: user.rol_id };
  const token = jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });

  return { token };
}

export async function getUserById(usuarioId: number): Promise<PublicUser> {
  const user = await Usuario.findByPk(usuarioId, {
    include: [{ model: Rol, as: "rol" }],
  });

  if (!user) {
    throw new NotFoundError("Usuario no encontrado.");
  }

  return user.toPublicJSON();
}
