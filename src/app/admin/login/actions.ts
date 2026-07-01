"use server";

import { redirect } from "next/navigation";
import { createSession, loginWithEmail } from "@/lib/auth";
import { verifyLoginCaptcha } from "@/lib/captcha";
import { loginSchema } from "@/lib/validators";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    captchaToken: formData.get("captchaToken"),
    captchaAnswer: formData.get("captchaAnswer")
  });

  if (!parsed.success) {
    redirect("/admin/login?error=1");
  }

  if (
    !verifyLoginCaptcha(parsed.data.captchaToken, parsed.data.captchaAnswer)
  ) {
    redirect("/admin/login?error=captcha");
  }

  const user = await loginWithEmail(parsed.data.email, parsed.data.password);
  if (!user) {
    redirect("/admin/login?error=1");
  }

  await createSession(user);
  redirect("/admin");
}
