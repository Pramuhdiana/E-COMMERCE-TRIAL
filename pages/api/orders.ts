import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

type OrderItem = {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
  readonly qty: number;
};

type Order = {
  readonly id: string;
  readonly userId: string;
  readonly phone: string;
  readonly items: ReadonlyArray<OrderItem>;
  readonly totalPrice: number;
  readonly createdAt: number;
};

type DbShape = { orders: Array<Order> };

function isOrder(x: unknown): x is Order {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.userId === "string" &&
    typeof o.phone === "string" &&
    Array.isArray(o.items) &&
    typeof o.totalPrice === "number" &&
    typeof o.createdAt === "number"
  );
}

async function ensureFile(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ orders: [] } satisfies DbShape, null, 2), "utf8");
  }
}

async function readDb(filePath: string): Promise<DbShape> {
  await ensureFile(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  try {
    const parsed = JSON.parse(raw) as DbShape;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.orders)) return { orders: [] };
    return parsed;
  } catch {
    return { orders: [] };
  }
}

async function writeDb(filePath: string, db: DbShape) {
  await fs.writeFile(filePath, JSON.stringify(db, null, 2), "utf8");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), "data", "orders.json");

  if (req.method === "GET") {
    const db = await readDb(filePath);
    res.status(200).json(db);
    return;
  }

  if (req.method === "POST") {
    if (!isOrder(req.body)) {
      res.status(400).json({ error: "Payload order tidak valid" });
      return;
    }

    const db = await readDb(filePath);
    db.orders.unshift(req.body);
    await writeDb(filePath, db);
    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end("Method Not Allowed");
}

