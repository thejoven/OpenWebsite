import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { mediaUploadRoot } from "@/lib/upload-paths";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function safeJoin(root: string, segments: string[]) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, ...segments);

  if (
    resolvedPath !== resolvedRoot &&
    !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    return null;
  }

  return resolvedPath;
}

async function readUpload(segments: string[]) {
  const roots = [
    mediaUploadRoot(),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads")
  ];

  for (const root of roots) {
    const target = safeJoin(root, segments);
    if (!target) {
      continue;
    }

    try {
      const fileStat = await stat(target);
      if (!fileStat.isFile()) {
        continue;
      }

      return {
        body: await readFile(target),
        contentType:
          contentTypes[path.extname(target).toLowerCase()] ||
          "application/octet-stream"
      };
    } catch {
      // Try the next storage root.
    }
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: uploadPath } = await params;
  const file = await readUpload(uploadPath || []);

  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(file.body, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": file.contentType
    }
  });
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: uploadPath } = await params;
  const file = await readUpload(uploadPath || []);

  if (!file) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(null, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": file.contentType
    }
  });
}
