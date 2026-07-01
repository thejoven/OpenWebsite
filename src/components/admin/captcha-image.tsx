import type { LoginCaptchaImage } from "@/lib/captcha";

export function CaptchaImage({ image }: { image: LoginCaptchaImage }) {
  return (
    <svg
      aria-label="登录验证码"
      className="h-12 w-full rounded-[8px] bg-[#1f1f1f] shadow-[rgb(77,77,77)_0px_0px_0px_1px_inset]"
      role="img"
      viewBox="0 0 128 56"
    >
      <rect fill="#1f1f1f" height="56" rx="8" width="128" />
      {image.lines.map((line, index) => (
        <line
          key={`line-${index}-${line.x1}`}
          stroke={index % 2 === 0 ? "#1ed760" : "#7c7c7c"}
          strokeLinecap="round"
          strokeOpacity={index % 2 === 0 ? 0.52 : 0.34}
          strokeWidth="2"
          {...line}
        />
      ))}
      {image.dots.map((dot, index) => (
        <circle
          fill={index % 3 === 0 ? "#1ed760" : "#b3b3b3"}
          fillOpacity={index % 3 === 0 ? 0.4 : 0.22}
          key={`dot-${index}-${dot.cx}-${dot.cy}`}
          {...dot}
        />
      ))}
      {image.characters.map((item, index) => (
        <text
          dominantBaseline="middle"
          fill="#ffffff"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          fontSize="28"
          fontWeight="700"
          key={`char-${index}-${item.char}`}
          textAnchor="middle"
          transform={`rotate(${item.rotate} ${item.x} ${item.y})`}
          x={item.x}
          y={item.y}
        >
          {item.char}
        </text>
      ))}
    </svg>
  );
}
