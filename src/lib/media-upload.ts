import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "./db";
import { mediaUploadRoot } from "./upload-paths";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const mimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg"
};

export function validateImageFile(file: File) {
  if (!mimeExtensions[file.type]) {
    return "Only JPG, PNG, WebP, GIF, and SVG images are supported.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be smaller than 5MB.";
  }

  return null;
}

export async function storeImageFile(file: File, uploadedById?: string | null) {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = mimeExtensions[file.type];
  const filename = `${randomUUID()}.${extension}`;
  const publicDir = path.join(mediaUploadRoot(), year, month);
  const targetPath = path.join(publicDir, filename);
  const url = `/uploads/${year}/${month}/${filename}`;

  await mkdir(publicDir, { recursive: true });
  await writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

  return prisma.mediaAsset.create({
    data: {
      url,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedById:
        uploadedById === "ai-ops-token" ? null : uploadedById || null
    }
  });
}

export function serializeMediaAsset(asset: {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedById: string | null;
  createdAt: Date;
}) {
  return {
    id: asset.id,
    url: asset.url,
    filename: asset.filename,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    size: asset.size,
    uploadedById: asset.uploadedById,
    createdAt: asset.createdAt.toISOString()
  };
}
