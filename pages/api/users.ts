import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";
import type { User } from "../../components/auth/types";

type UsersDb = { users: Array<User> };

async function ensureFile(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ users: [] } satisfies UsersDb, null, 2), "utf8");
  }
}

async function readDb(filePath: string): Promise<UsersDb> {
  await ensureFile(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  try {
    const parsed = JSON.parse(raw) as UsersDb;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.users)) return { users: [] };
    return parsed;
  } catch {
    return { users: [] };
  }
}

async function writeDb(filePath: string, db: UsersDb) {
  await fs.writeFile(filePath, JSON.stringify(db, null, 2), "utf8");
}

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").replace(/^\+62/, "0");
}

function isValidPhone(phone: string) {
  const p = normalizePhone(phone);
  return /^0\d{9,14}$/.test(p) || p === "404";
}

function isValidPassword(password: string) {
  return typeof password === "string" && password.length >= 6;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), "data", "users.json");

  if (req.method === "GET") {
    const db = await readDb(filePath);
    res.status(200).json(db);
    return;
  }

  if (req.method === "POST") {
    const body = req.body as Partial<User> | null;
    const phone = typeof body?.phone === "string" ? normalizePhone(body.phone) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!isValidPhone(phone)) {
      res.status(400).json({ ok: false, error: "Nomor telepon tidak valid." });
      return;
    }
    if (!isValidPassword(password)) {
      res.status(400).json({ ok: false, error: "Password minimal 6 karakter." });
      return;
    }

    const db = await readDb(filePath);
    if (db.users.some((u) => u.phone === phone)) {
      res.status(409).json({ ok: false, error: "Nomor telepon sudah terdaftar." });
      return;
    }

    const user: User = {
      id: typeof body?.id === "string" && body.id ? body.id : `u-${Date.now()}`,
      phone,
      password,
      createdAt: typeof body?.createdAt === "number" ? body.createdAt : Date.now(),
    };

    db.users.unshift(user);
    await writeDb(filePath, db);
    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end("Method Not Allowed");
}

