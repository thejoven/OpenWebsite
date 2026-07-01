"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ContactForm() {
  const t = useTranslations("Contact");
  const common = useTranslations("Common");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.sourcePage = window.location.pathname;

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      form.reset();
      setState("success");
    } else {
      setState("error");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-bold text-[#33445a]">{t("name")}</span>
          <input className="admin-field" name="name" required />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-[#33445a]">{t("email")}</span>
          <input className="admin-field" name="email" required type="email" />
        </label>
      </div>
      <label>
        <span className="mb-2 block text-sm font-bold text-[#33445a]">{t("phone")}</span>
        <input className="admin-field" name="phone" type="tel" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-bold text-[#33445a]">{t("message")}</span>
        <textarea className="admin-field min-h-36 resize-y" name="message" required />
      </label>
      <button
        className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-[#0e4fa0] px-5 py-3 font-black text-white hover:bg-[#083a76] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={state === "submitting"}
        type="submit"
      >
        <Send aria-hidden className="h-4 w-4" />
        {state === "submitting" ? common("saving") : t("submit")}
      </button>
      {state === "success" ? (
        <p className="rounded-md border border-[#9fd5c7] bg-[#e8f7f3] px-4 py-3 text-sm font-bold text-[#0b665f]">
          {t("success")}
        </p>
      ) : null}
      {state === "error" ? (
        <p className="rounded-md border border-[#efb5a8] bg-[#fff0ed] px-4 py-3 text-sm font-bold text-[#9c2f1a]">
          {t("error")}
        </p>
      ) : null}
    </form>
  );
}
