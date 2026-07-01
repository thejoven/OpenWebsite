import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";

export function formatDateTime(date: Date | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("zh", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function scoreColor(score: number) {
  if (score >= 85) return "admin-score-good";
  if (score >= 70) return "admin-score-warning";
  return "admin-score-danger";
}

export function SystemHeader({
  actions,
  description,
  title
}: {
  actions?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="admin-page-header">
      <div>
        <h1 className="admin-page-title">{title}</h1>
        <p className="admin-page-description">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function SystemNotice({
  error,
  saved
}: {
  error?: string;
  saved?: string;
}) {
  if (!error && !saved) {
    return null;
  }

  return (
    <Alert className="mt-5" variant={error ? "destructive" : "success"}>
      {error ? "操作失败，请检查输入内容或唯一性。" : "操作已完成。"}
    </Alert>
  );
}
