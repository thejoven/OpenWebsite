import path from "node:path";

export function mediaUploadRoot() {
  return (
    process.env.MEDIA_UPLOAD_DIR ||
    path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "uploads")
  );
}
