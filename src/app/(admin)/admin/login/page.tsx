import { redirect } from "next/navigation";
import { loginAction } from "./actions";
import { CaptchaImage } from "@/components/admin/captcha-image";
import { OwLogo } from "@/components/admin/ow-logo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, LabelText } from "@/components/ui/label";
import { getSession } from "@/lib/auth";
import { createLoginCaptcha } from "@/lib/captcha";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  const query = await searchParams;
  const captcha = createLoginCaptcha();
  const errorMessage =
    query.error === "captcha"
      ? "验证码错误或已过期，请重新输入。"
      : query.error
        ? "登录失败，请检查邮箱和密码。"
        : "";

  return (
    <main className="admin-root grid min-h-screen place-items-center bg-[var(--admin-bg)] px-4 py-12 text-[var(--admin-text)]">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-6">
            <OwLogo className="h-12 w-12" />
            <h1 className="mt-5 text-2xl font-bold text-white">管理员登录</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
              使用 seed 初始化的管理员邮箱和密码登录。
            </p>
          </div>
          <form action={loginAction} className="grid gap-4">
            <Label>
              <LabelText>邮箱</LabelText>
              <Input name="email" required type="email" />
            </Label>
            <Label>
              <LabelText>密码</LabelText>
              <Input name="password" required type="password" />
            </Label>
            <Label>
              <LabelText>验证码</LabelText>
              <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                <CaptchaImage image={captcha.image} />
                <Input
                  autoComplete="off"
                  inputMode="numeric"
                  name="captchaAnswer"
                  placeholder="输入结果"
                  required
                />
              </div>
              <input name="captchaToken" type="hidden" value={captcha.token} />
            </Label>
            {errorMessage ? (
              <Alert variant="destructive">{errorMessage}</Alert>
            ) : null}
            <Button type="submit">登录</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
