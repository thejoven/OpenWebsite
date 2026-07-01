"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ImageUploadField({
  name,
  label,
  defaultValue,
  placeholder
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
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

      setValue(payload.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <span className="admin-label">{label}</span>
      <input name={name} type="hidden" value={value} />
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          className="admin-field"
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <Button
          disabled={isUploading}
          label={false}
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="secondary"
        >
          {isUploading ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus aria-hidden className="h-4 w-4" />
          )}
          上传
        </Button>
      </div>
      <input
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void upload(file);
          }
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        type="file"
      />
      {value ? (
        <div className="relative mt-3 h-44 overflow-hidden rounded-[8px] bg-[#252525] shadow-[rgb(77,77,77)_0px_0px_0px_1px_inset]">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="320px"
            src={value}
            unoptimized
          />
        </div>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm font-bold text-[var(--admin-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
