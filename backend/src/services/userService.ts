import bcrypt from "bcrypt";
import { UniqueConstraintError } from "sequelize";
import { Usuario, Rol, Tienda } from "../models";
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../utils/errors";
import type { UsuarioAttributes } from "../models";
import { ROLES } from "./authService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Conjunto de roles válidos del sistema. */
const VALID_ROLES = new Set<string>([ROLES.ADMIN, ROLES.SELLER, ROLES.WAREHOUSE]);

export type PublicUser = Omit<UsuarioAttributes, "password_hash">;

export interface ListResult {
  items: PublicUser[];
  page: number;
  pageSize: number;
  total: number;
}

interface CreateUserInput {
  email: unknown;
  nombre: unknown;
  password: unknown;
  rol: unknown;
  tienda_id?: unknown;
}

function assertString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new ValidationError("Invalid request data", [
      `${fieldName} debe ser un texto (string).`,
    ]);
  }
  return value;
}

/** Incluye el rol y la tienda en las consultas de usuario. */
const BASE_INCLUDE = [
  { model: Rol, as: "rol" },
  { model: Tienda, as: "tienda" },
];

/** Lista usuarios con paginación, sin password_hash. */
export async function listUsers(
  page: number,
  pageSize: number,
): Promise<ListResult> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safePageSize =
    Number.isInteger(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 10;

  const { count, rows } = await Usuario.findAndCountAll({
    include: BASE_INCLUDE,
    order: [["usuario_id", "ASC"]],
    limit: safePageSize,
    offset: (safePage - 1) * safePageSize,
    distinct: true,
  });

  return {
    items: rows.map((u) => u.toPublicJSON()),
    page: safePage,
    pageSize: safePageSize,
    total: count,
  };
}

/** Obtiene un usuario por id, sin password_hash. */
export async function getUserById(usuarioId: number): Promise<PublicUser> {
  const user = await Usuario.findByPk(usuarioId, { include: BASE_INCLUDE });
  if (!user) {
    throw new NotFoundError("Usuario no encontrado.");
  }
  return user.toPublicJSON();
}

/** Crea un usuario. Solo ADMIN (validado en middleware) con rol existente. */
export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const rawEmail = assertString(input.email, "email");
  const rawNombre = assertString(input.nombre, "nombre");
  const rawPassword = assertString(input.password, "password");
  const rawRol = assertString(input.rol, "rol");

  const email = rawEmail.trim().toLowerCase();
  const nombre = rawNombre.trim();

  const details: unknown[] = [];
  if (!email) details.push("email es requerido.");
  if (!nombre) details.push("nombre es requerido.");
  if (!rawPassword) details.push("password es requerido.");
  if (!rawRol) details.push("rol es requerido.");
  if (details.length > 0) {
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
  if (!VALID_ROLES.has(rawRol.toUpperCase())) {
    throw new ValidationError("Invalid request data", [
      `Rol inválido. Roles permitidos: ${Array.from(VALID_ROLES).join(", ")}.`,
    ]);
  }

  const rol = await Rol.findOne({ where: { nombre_rol: rawRol.toUpperCase() } });
  if (!rol) {
    throw new NotFoundError("No se encontró el rol solicitado en la base de datos.");
  }

  let tienda_id: number;
  if (input.tienda_id !== undefined && input.tienda_id !== null) {
    if (!Number.isInteger(input.tienda_id)) {
      throw new ValidationError("Invalid request data", [
        "tienda_id debe ser un número entero.",
      ]);
    }
    const tienda = await Tienda.findByPk(input.tienda_id as number);
    if (!tienda) {
      throw new NotFoundError("La tienda indicada no existe.");
    }
    tienda_id = tienda.tienda_id;
  } else {
    const casaMatriz = await Tienda.findOne({
      where: { nombre: "Casa Matriz" },
    });
    if (!casaMatriz) {
      throw new NotFoundError(
        "No se encontró la tienda Casa Matriz en la base de datos.",
      );
    }
    tienda_id = casaMatriz.tienda_id;
  }

  const passwordHash = await bcrypt.hash(rawPassword, 10);

  try {
    const newUser = await Usuario.create({
      email,
      nombre,
      password_hash: passwordHash,
      rol_id: rol.rol_id,
      tienda_id,
    });
    return (await getUserById(newUser.usuario_id));
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ConflictError("El email ya está registrado.");
    }
    throw error;
  }
}

/** Actualiza un usuario según el actor. Devuelve el usuario actualizado. */
export async function updateUser(
  usuarioId: number,
  actorId: number,
  actorRol: string,
  body: Record<string, unknown>,
): Promise<PublicUser> {
  const target = await Usuario.findByPk(usuarioId);
  if (!target) {
    throw new NotFoundError("Usuario no encontrado.");
  }

  const isAdmin = actorRol === ROLES.ADMIN;
  const isOwner = actorId === target.usuario_id;

  if (!isAdmin && !isOwner) {
    throw new ForbiddenError("No tienes permisos para modificar este usuario.");
  }

  const allowedFields = new Set<keyof UsuarioAttributes>(
    isAdmin
      ? ["email", "nombre", "rol_id", "tienda_id", "password_hash"]
      : ["email", "nombre"],
  );

  const updates: Partial<UsuarioAttributes> = {};

  // email
  if (body.email !== undefined) {
    assertString(body.email, "email");
    const email = (body.email as string).trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
      throw new ValidationError("Invalid request data", ["Formato de email inválido."]);
    }
    updates.email = email;
  }

  // nombre
  if (body.nombre !== undefined) {
    assertString(body.nombre, "nombre");
    const nombre = (body.nombre as string).trim();
    if (!nombre) {
      throw new ValidationError("Invalid request data", ["nombre es requerido."]);
    }
    updates.nombre = nombre;
  }

  // password (propietario o admin)
  if (body.password !== undefined) {
    assertString(body.password, "password");
    if ((body.password as string).length < 6) {
      throw new ValidationError("Invalid request data", [
        "La contraseña debe tener al menos 6 caracteres.",
      ]);
    }
    updates.password_hash = await bcrypt.hash(body.password as string, 10);
  }

  // rol (solo ADMIN; un propietario no puede cambiarlo)
  if (body.rol !== undefined) {
    if (!isAdmin) {
      throw new ForbiddenError("No tienes permisos para cambiar el rol.");
    }
    assertString(body.rol, "rol");
    const rolName = (body.rol as string).toUpperCase();
    if (!VALID_ROLES.has(rolName)) {
      throw new ValidationError("Invalid request data", [
        `Rol inválido. Roles permitidos: ${Array.from(VALID_ROLES).join(", ")}.`,
      ]);
    }
    const rol = await Rol.findOne({ where: { nombre_rol: rolName } });
    if (!rol) {
      throw new NotFoundError("No se encontró el rol solicitado en la base de datos.");
    }
    updates.rol_id = rol.rol_id;
  }

  // tienda (solo ADMIN)
  if (body.tienda_id !== undefined) {
    if (!isAdmin) {
      throw new ForbiddenError("No tienes permisos para cambiar la tienda.");
    }
    if (!Number.isInteger(body.tienda_id)) {
      throw new ValidationError("Invalid request data", [
        "tienda_id debe ser un número entero.",
      ]);
    }
    const tienda = await Tienda.findByPk(body.tienda_id as number);
    if (!tienda) {
      throw new NotFoundError("La tienda indicada no existe.");
    }
    updates.tienda_id = tienda.tienda_id;
  }

  const hasUpdatableField = Object.keys(updates).some((k) =>
    (allowedFields as Set<string>).has(k),
  );
  if (!hasUpdatableField) {
    throw new ValidationError("Invalid request data", [
      "No se proporcionaron campos editables válidos.",
    ]);
  }

  await target.update(updates);
  return getUserById(target.usuario_id);
}

/** Activa o desactiva un usuario (no se borra físicamente). Solo ADMIN. */
export async function updateUserStatus(
  usuarioId: number,
  activo: unknown,
): Promise<PublicUser> {
  if (typeof activo !== "boolean") {
    throw new ValidationError("Invalid request data", ["activo debe ser booleano."]);
  }

  const target = await Usuario.findByPk(usuarioId);
  if (!target) {
    throw new NotFoundError("Usuario no encontrado.");
  }

  if (activo === false && target.activo === false) {
    throw new ConflictError("El usuario ya está desactivado.");
  }

  await target.update({ activo });
  return getUserById(target.usuario_id);
}
