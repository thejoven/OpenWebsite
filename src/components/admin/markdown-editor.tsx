"use client";

import { Bold, Eye, Heading2, ImagePlus, List, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

function fileAltText(file: File) {
  return (
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim() || "image"
  );
}

export function MarkdownEditor({
  name,
  label,
  defaultValue
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue || "");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  function insert(markdown: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setValue((current) => `${current}${markdown}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${value.slice(0, start)}${markdown}${value.slice(end)}`;
    setValue(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + markdown.length;
      textarea.selectionEnd = start + markdown.length;
    });
  }

  async function uploadImage(file: File) {
    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "上传失败");
      }

      insert(`\n\n![${fileAltText(file)}](${payload.url})\n\n`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="admin-label mb-0">{label}</span>
        <div className="flex flex-wrap gap-2">
          <Button
            label={false}
            onClick={() => insert("\n\n## 小标题\n\n")}
            size="icon"
            title="插入二级标题"
            type="button"
            variant="secondary"
          >
            <Heading2 aria-hidden className="h-4 w-4" />
          </Button>
          <Button
            label={false}
            onClick={() => insert("**加粗文字**")}
            size="icon"
            title="插入加粗"
            type="button"
            variant="secondary"
          >
            <Bold aria-hidden className="h-4 w-4" />
          </Button>
          <Button
            label={false}
            onClick={() => insert("\n- 列表项\n")}
            size="icon"
            title="插入列表"
            type="button"
            variant="secondary"
          >
            <List aria-hidden className="h-4 w-4" />
          </Button>
          <Button
            className="text-[var(--admin-green)]"
            disabled={isUploading}
            label={false}
            onClick={() => fileRef.current?.click()}
            size="icon"
            title="上传并插入图片"
            type="button"
            variant="secondary"
          >
            {isUploading ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus aria-hidden className="h-4 w-4" />
            )}
          </Button>
          <Button
            label={false}
            onClick={() => setIsPreviewing((current) => !current)}
            size="icon"
            title="预览"
            type="button"
            variant="secondary"
          >
            <Eye aria-hidden className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <textarea
        className="admin-field min-h-80 resize-y font-mono text-sm leading-6"
        name={name}
        onChange={(event) => setValue(event.target.value)}
        ref={textareaRef}
        value={value}
      />
      <input
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void uploadImage(file);
          }
          event.currentTarget.value = "";
        }}
        ref={fileRef}
        type="file"
      />
      {error ? (
        <p className="mt-2 text-sm font-bold text-[var(--admin-danger)]">
          {error}
        </p>
      ) : null}
      {isPreviewing ? (
        <div className="prose admin-card admin-card-bordered mt-4 max-w-none p-4">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}
