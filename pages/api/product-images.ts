import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

type ImagesDb = { images: Record<string, string> };

async function ensureFile(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ images: {} } satisfies ImagesDb, null, 2), "utf8");
  }
}

async function readDb(filePath: string): Promise<ImagesDb> {
  await ensureFile(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  try {
    const parsed = JSON.parse(raw) as ImagesDb;
    if (!parsed || typeof parsed !== "object" || !parsed.images || typeof parsed.images !== "object") {
      return { images: {} };
    }
    return { images: parsed.images as Record<string, string> };
  } catch {
    return { images: {} };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), "data", "product-images.json");

  if (req.method === "GET") {
    const db = await readDb(filePath);
    res.status(200).json(db);
    return;
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end("Method Not Allowed");
}

