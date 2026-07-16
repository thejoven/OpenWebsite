import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import { SystemHeader } from "@/components/admin/system/system-common";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function SystemMediaPage() {
  const session = await requireAdmin();
  const media = await prisma.mediaAsset.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 48
  });

  return (
    <AdminShell email={session.email}>
      <SystemHeader
        description="查看最近上传到文章、OG 图片和 AI 运维接口的媒体文件。"
        title="系统管理 / 媒体库"
      />

      <Card className="mt-8">
        <CardContent>
          <h2 className="admin-section-title">
            <ImageIcon aria-hidden className="h-5 w-5" />
            最近上传图片
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {media.map((asset) => (
              <div
                className="rounded-[8px] bg-[#1f1f1f] p-3 shadow-[rgb(77,77,77)_0px_0px_0px_1px_inset]"
                key={asset.id}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-[#252525]">
                  <Image
                    alt={asset.originalName}
                    className="object-cover"
                    fill
                    sizes="240px"
                    src={asset.url}
                    unoptimized
                  />
                </div>
                <p className="mt-3 truncate text-sm font-bold text-white">
                  {asset.originalName}
                </p>
                <p className="mt-1 break-all text-xs text-[var(--admin-muted)]">
                  {asset.url}
                </p>
              </div>
            ))}
            {media.length === 0 ? (
              <p className="rounded-[8px] p-4 text-sm font-bold text-[var(--admin-muted)] shadow-[rgb(77,77,77)_0px_0px_0px_1px_inset]">
                还没有上传图片。
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
