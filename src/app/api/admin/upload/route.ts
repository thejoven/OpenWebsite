import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { storeImageFile } from "@/lib/media-upload";

export const runtime = "nodejs";

function uploadError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return uploadError("未登录或权限不足", 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return uploadError("请选择图片文件");
  }

  try {
    const asset = await storeImageFile(file, session.userId);
    return NextResponse.json({ url: asset.url });
  } catch (error) {
    return uploadError(error instanceof Error ? error.message : "上传失败");
  }
}
