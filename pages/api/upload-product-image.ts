import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { promises as fs } from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

function sanitizeSegment(input: string) {
  return input.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 80);
}

type OkResponse = { ok: true; path: string };
type ErrResponse = { ok: false; error: string };

type ImagesDb = { images: Record<string, string> };

async function readImagesDb(filePath: string): Promise<ImagesDb> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as ImagesDb;
    if (!parsed || typeof parsed !== "object" || !parsed.images || typeof parsed.images !== "object") {
      return { images: {} };
    }
    return { images: parsed.images as Record<string, string> };
  } catch {
    return { images: {} };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OkResponse | ErrResponse>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method tidak didukung" });
    return;
  }

  const form = formidable({
    multiples: false,
    maxFileSize: 8 * 1024 * 1024, // 8MB
  });

  const { fields, files } = await new Promise<{
    fields: formidable.Fields;
    files: formidable.Files;
  }>((resolve, reject) => {
    form.parse(req, (err, f, fl) => {
      if (err) reject(err);
      else resolve({ fields: f, files: fl });
    });
  }).catch((e) => {
    res.status(400).json({ ok: false, error: e instanceof Error ? e.message : "Upload gagal" });
    return { fields: {}, files: {} };
  });

  const productIdField = (fields as Record<string, unknown>).productId;
  const productIdRaw = Array.isArray(productIdField) ? productIdField[0] : productIdField;
  const productId = typeof productIdRaw === "string" ? productIdRaw : "";
  const safeProductId = sanitizeSegment(productId || "product");

  const fileField = (files as Record<string, unknown>).file as
    | formidable.File
    | formidable.File[]
    | undefined;
  const file = fileField ?? undefined;
  const picked = Array.isArray(file) ? file[0] : file;
  if (!picked) {
    res.status(400).json({ ok: false, error: "File tidak ditemukan" });
    return;
  }

  const originalName = picked.originalFilename ?? "upload";
  const ext = path.extname(originalName) || ".png";
  const filename = `${safeProductId}-${Date.now()}${ext}`;
  const relUrlPath = `/assets/products/${filename}`;
  const outDir = path.join(process.cwd(), "public", "assets", "products");
  const outPath = path.join(outDir, filename);

  await fs.mkdir(outDir, { recursive: true });

  // formidable v3 menyimpan file ke path temporary, kita salin ke public/.
  const tmpPath = (picked as any).filepath as string | undefined;
  if (!tmpPath) {
    res.status(400).json({ ok: false, error: "Filepath temporary tidak ditemukan" });
    return;
  }

  await fs.copyFile(tmpPath, outPath);

  // Simpan mapping productId -> path gambar ke file JSON agar tetap ada walau localStorage dihapus.
  if (productId) {
    const imagesDbPath = path.join(process.cwd(), "data", "product-images.json");
    await fs.mkdir(path.dirname(imagesDbPath), { recursive: true });
    const db = await readImagesDb(imagesDbPath);
    const next = { images: { ...db.images, [productId]: relUrlPath } } satisfies ImagesDb;
    await fs.writeFile(imagesDbPath, JSON.stringify(next, null, 2), "utf8");
  }

  res.status(200).json({ ok: true, path: relUrlPath });
}

