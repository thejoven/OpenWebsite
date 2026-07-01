import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual
} from "node:crypto";

const CAPTCHA_TTL_MS = 5 * 60 * 1000;

type CaptchaPayload = {
  answer: string;
  expiresAt: number;
  nonce: string;
};

export type LoginCaptchaImage = {
  characters: {
    char: string;
    rotate: number;
    x: number;
    y: number;
  }[];
  dots: {
    cx: number;
    cy: number;
    r: number;
  }[];
  lines: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  }[];
};

function captchaSecret() {
  return `${process.env.AUTH_SECRET || "openwebsite-development-secret"}:captcha`;
}

function sign(body: string) {
  return createHmac("sha256", captchaSecret()).update(body).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

function encode(payload: CaptchaPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string): CaptchaPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, sign(body))) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as CaptchaPayload;
  } catch {
    return null;
  }
}

export function createLoginCaptcha() {
  const left = randomInt(2, 10);
  const right = randomInt(2, 10);
  const question = `${left}+${right}`;
  const payload: CaptchaPayload = {
    answer: String(left + right),
    expiresAt: Date.now() + CAPTCHA_TTL_MS,
    nonce: randomBytes(12).toString("base64url")
  };

  return {
    image: createCaptchaImage(question),
    token: encode(payload)
  };
}

export function verifyLoginCaptcha(token: string, answer: string) {
  const payload = decode(token);
  if (!payload || payload.expiresAt < Date.now()) {
    return false;
  }

  return payload.answer === answer.trim();
}

function createCaptchaImage(question: string): LoginCaptchaImage {
  return {
    characters: question.split("").map((char, index) => ({
      char,
      rotate: randomInt(-14, 15),
      x: 18 + index * 22,
      y: randomInt(34, 43)
    })),
    dots: Array.from({ length: 18 }, () => ({
      cx: randomInt(8, 116),
      cy: randomInt(8, 48),
      r: randomInt(1, 3)
    })),
    lines: Array.from({ length: 4 }, () => ({
      x1: randomInt(4, 34),
      x2: randomInt(88, 124),
      y1: randomInt(10, 48),
      y2: randomInt(10, 48)
    }))
  };
}
